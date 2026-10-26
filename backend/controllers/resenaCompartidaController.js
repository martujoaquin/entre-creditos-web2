const {
    Op,
    ForeignKeyConstraintError,
    UniqueConstraintError
} = require('sequelize');
const sequelize = require('../config/database');
const {
    ResenaCompartida,
    Resena,
    Usuario,
    Pelicula
} = require('../models');

const MAX_DESTINATARIOS = 20;

const usuarioPublico = {
    attributes: ['id_usuario', 'nombre_completo', 'avatar']
};

const enteroPositivo = (valor) => {
    if (typeof valor === 'number' && Number.isInteger(valor) && valor > 0) return valor;
    if (typeof valor === 'string' && /^\d+$/.test(valor.trim()) && Number(valor) > 0) return Number(valor);
    return null;
};

const usuarioAutenticado = (req, res) => {
    const idUsuario = enteroPositivo(req.user?.id_usuario);
    if (!idUsuario) {
        res.status(401).json({ mensaje: 'Esta operación requiere autenticación' });
        return null;
    }
    return idUsuario;
};

const obtenerUsuariosDisponibles = async (req, res) => {
    const idUsuario = usuarioAutenticado(req, res);
    if (!idUsuario) return;

    try {
        const usuarios = await Usuario.findAll({
            attributes: ['id_usuario', 'nombre_completo', 'avatar'],
            where: {
                activo: 1,
                id_usuario: { [Op.ne]: idUsuario }
            },
            order: [['nombre_completo', 'ASC']]
        });

        return res.json({ success: true, usuarios });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudieron cargar los usuarios disponibles' });
    }
};

const obtenerCompartidas = async (req, res) => {
    const idUsuario = usuarioAutenticado(req, res);
    if (!idUsuario) return;

    try {
        const compartidas = await ResenaCompartida.findAll({
            attributes: ['id_compartida', 'fecha_compartida'],
            where: { id_usuario_destino: idUsuario },
            include: [
                {
                    model: Usuario,
                    as: 'remitente',
                    ...usuarioPublico
                },
                {
                    model: Resena,
                    as: 'resena',
                    attributes: [
                        'id_resena', 'frase_destacada', 'contenido', 'puntuacion',
                        'fecha_creacion', 'fecha_modificacion'
                    ],
                    include: [
                        {
                            model: Usuario,
                            as: 'autor',
                            ...usuarioPublico
                        },
                        {
                            model: Pelicula,
                            as: 'pelicula',
                            attributes: ['id_pelicula', 'titulo', 'director', 'anio', 'imagen'],
                            where: { activo: 1 }
                        }
                    ]
                }
            ],
            order: [['fecha_compartida', 'DESC']]
        });

        return res.json({
            success: true,
            compartidas: compartidas.map((compartida) => ({
                id_compartida: compartida.id_compartida,
                fecha_compartida: compartida.fecha_compartida,
                remitente: compartida.remitente,
                resena: compartida.resena
            }))
        });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudieron cargar las reseñas compartidas' });
    }
};

const compartirResena = async (req, res) => {
    const idUsuarioRemitente = usuarioAutenticado(req, res);
    if (!idUsuarioRemitente) return;

    const body = req.body || {};
    const camposNoPermitidos = Object.keys(body).filter((campo) => !['id_resena', 'destinatarios'].includes(campo));
    if (camposNoPermitidos.length > 0) return res.status(400).json({ mensaje: 'Se recibieron campos no permitidos' });

    const idResena = enteroPositivo(body.id_resena);
    if (!idResena) return res.status(400).json({ mensaje: 'La reseña es obligatoria' });

    if (!Array.isArray(body.destinatarios)) return res.status(400).json({ mensaje: 'Seleccioná al menos un destinatario' });

    const destinatarios = [];
    for (const valor of body.destinatarios) {
        const idDestinatario = enteroPositivo(valor);
        if (!idDestinatario) return res.status(400).json({ mensaje: 'Los destinatarios seleccionados no son válidos' });
        if (!destinatarios.includes(idDestinatario)) destinatarios.push(idDestinatario);
    }

    if (destinatarios.length === 0) return res.status(400).json({ mensaje: 'Seleccioná al menos un destinatario' });
    if (destinatarios.length > MAX_DESTINATARIOS) return res.status(400).json({ mensaje: 'No se puede compartir con más de 20 destinatarios por vez' });
    if (destinatarios.includes(idUsuarioRemitente)) return res.status(400).json({ mensaje: 'No podés compartir una reseña con vos mismo' });

    try {
        const resena = await Resena.findByPk(idResena, {
            attributes: ['id_resena'],
            include: [{ model: Pelicula, as: 'pelicula', attributes: ['id_pelicula', 'activo'] }]
        });
        if (!resena || !resena.pelicula) return res.status(404).json({ mensaje: 'La reseña no está disponible' });
        if (resena.pelicula.activo !== 1) return res.status(404).json({ mensaje: 'La reseña no está disponible' });

        const usuariosActivos = await Usuario.findAll({
            attributes: ['id_usuario'],
            where: {
                activo: 1,
                id_usuario: destinatarios
            }
        });
        if (usuariosActivos.length !== destinatarios.length) return res.status(404).json({ mensaje: 'Uno de los destinatarios no está disponible' });

        const existentes = await ResenaCompartida.findAll({
            attributes: ['id_usuario_destino'],
            where: {
                id_resena: idResena,
                id_usuario_remitente: idUsuarioRemitente,
                id_usuario_destino: destinatarios
            }
        });
        const yaCompartidos = new Set(existentes.map((item) => item.id_usuario_destino));
        const nuevos = destinatarios.filter((id) => !yaCompartidos.has(id));

        if (nuevos.length === 0) {
            return res.status(200).json({
                success: true,
                mensaje: 'La reseña ya había sido compartida con los destinatarios seleccionados',
                compartidos: [],
                ya_compartidos: destinatarios
            });
        }

        const transaction = await sequelize.transaction();
        try {
            await ResenaCompartida.bulkCreate(
                nuevos.map((idUsuarioDestino) => ({
                    id_resena: idResena,
                    id_usuario_remitente: idUsuarioRemitente,
                    id_usuario_destino: idUsuarioDestino
                })),
                { transaction }
            );
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        return res.status(201).json({
            success: true,
            mensaje: 'Reseña compartida correctamente',
            compartidos: nuevos,
            ya_compartidos: destinatarios.filter((id) => yaCompartidos.has(id))
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) return res.status(409).json({ mensaje: 'Una o más compartidas ya existen' });
        if (error instanceof ForeignKeyConstraintError) return res.status(404).json({ mensaje: 'La reseña o uno de los usuarios no existe' });
        return res.status(500).json({ mensaje: 'No se pudo compartir la reseña' });
    }
};

module.exports = {
    obtenerUsuariosDisponibles,
    obtenerCompartidas,
    compartirResena
};
