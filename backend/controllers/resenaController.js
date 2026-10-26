const {
    ForeignKeyConstraintError,
    UniqueConstraintError,
    ValidationError
} = require('sequelize');
const { Resena, Usuario, Pelicula } = require('../models');

const autorInclude = {
    model: Usuario,
    as: 'autor',
    attributes: ['id_usuario', 'nombre_completo', 'avatar']
};

const idValido = (valor) => Number.isInteger(valor) && valor > 0;

const entero = (valor) => {
    if (typeof valor === 'number' && Number.isInteger(valor)) return valor;
    if (typeof valor === 'string' && /^\d+$/.test(valor.trim())) return Number(valor.trim());
    return null;
};

const validarDatosResena = (body, requierePelicula) => {
    const camposPermitidos = ['id_pelicula', 'frase_destacada', 'contenido', 'puntuacion'];
    const camposNoPermitidos = Object.keys(body).filter((campo) => !camposPermitidos.includes(campo));

    if (camposNoPermitidos.length > 0) {
        return { error: 'Se recibieron campos no permitidos' };
    }

    const idPelicula = body.id_pelicula === undefined ? null : entero(body.id_pelicula);
    const frase = body.frase_destacada === undefined || body.frase_destacada === null
        ? null
        : String(body.frase_destacada).trim();
    const contenido = typeof body.contenido === 'string' ? body.contenido.trim() : '';
    const puntuacion = entero(body.puntuacion);

    if (requierePelicula && !idValido(idPelicula)) {
        return { error: 'La película es obligatoria' };
    }

    if (contenido === '') {
        return { error: 'El contenido es obligatorio' };
    }

    if (!idValido(puntuacion)) {
        return { error: 'La puntuación es obligatoria' };
    }

    if (puntuacion < 1 || puntuacion > 5) {
        return { error: 'La puntuación debe estar entre 1 y 5' };
    }

    if (frase !== null && frase.length > 220) {
        return { error: 'La frase destacada no puede superar los 220 caracteres' };
    }

    return {
        datos: {
            id_pelicula: idPelicula,
            frase_destacada: frase === '' ? null : frase,
            contenido,
            puntuacion
        }
    };
};

const obtenerResenasLanding = async (req, res) => {
    try {
        const resenas = await Resena.findAll({
            attributes: ['id_resena', 'frase_destacada', 'contenido', 'puntuacion', 'fecha_creacion'],
            include: [
                {
                    ...autorInclude,
                    where: { activo: 1 }
                },
                {
                    model: Pelicula,
                    as: 'pelicula',
                    attributes: ['id_pelicula', 'titulo', 'director', 'anio', 'imagen'],
                    where: { activo: 1 }
                }
            ],
            order: [['fecha_creacion', 'DESC'], ['id_resena', 'DESC']],
            limit: 3
        });

        return res.json({ success: true, resenas });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudieron cargar las reseñas' });
    }
};

const obtenerResenasPorPelicula = async (req, res) => {
    const id = entero(req.params.id);

    if (!idValido(id)) return res.status(400).json({ mensaje: 'La película es obligatoria' });

    try {
        const pelicula = await Pelicula.findByPk(id, { attributes: ['id_pelicula', 'activo'] });

        if (!pelicula || pelicula.activo !== 1) {
            return res.status(404).json({ mensaje: 'La película no está disponible' });
        }

        // En Etapa 6 esta ruta deberá recibir middleware de autenticación.
        const resenas = await Resena.findAll({
            attributes: [
                'id_resena', 'id_usuario', 'id_pelicula', 'frase_destacada',
                'contenido', 'puntuacion', 'fecha_creacion', 'fecha_modificacion'
            ],
            where: { id_pelicula: id },
            include: [autorInclude],
            order: [['fecha_creacion', 'DESC']]
        });

        return res.json({ success: true, resenas });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudieron cargar las reseñas' });
    }
};

const obtenerResenasAdmin = async (req, res) => {
    // En Etapa 6 esta ruta deberá protegerse con middleware de autorización administrativa.
    try {
        const resenas = await Resena.findAll({
            attributes: ['id_resena', 'frase_destacada', 'contenido', 'puntuacion', 'fecha_creacion'],
            include: [
                autorInclude,
                {
                    model: Pelicula,
                    as: 'pelicula',
                    attributes: ['id_pelicula', 'titulo', 'imagen', 'activo']
                }
            ],
            order: [['fecha_creacion', 'DESC'], ['id_resena', 'DESC']]
        });

        return res.json({ success: true, resenas });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudieron cargar las reseñas' });
    }
};

const obtenerResena = async (req, res) => {
    const id = entero(req.params.id);
    if (!idValido(id)) return res.status(400).json({ mensaje: 'La reseña es obligatoria' });

    // Hasta Etapa 6 el detalle queda bloqueado: Web I exigía autor o administrador.
    if (!req.user) return res.status(401).json({ mensaje: 'Esta operación requiere autenticación' });

    try {
        const resena = await Resena.findByPk(id, {
            attributes: [
                'id_resena', 'id_usuario', 'id_pelicula', 'frase_destacada',
                'contenido', 'puntuacion', 'fecha_creacion', 'fecha_modificacion'
            ],
            include: [autorInclude]
        });

        if (!resena) return res.status(404).json({ mensaje: 'La reseña no existe' });

        const esAdmin = req.user.es_admin === 1 || req.user.es_admin === true;
        if (!esAdmin && resena.id_usuario !== req.user.id_usuario) {
            return res.status(403).json({ mensaje: 'No tiene permisos para ver esta reseña' });
        }

        return res.json({ success: true, resena });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudo obtener la reseña' });
    }
};

const crearResena = async (req, res) => {
    if (!req.user) return res.status(401).json({ mensaje: 'Esta operación requiere autenticación' });

    const body = req.body || {};
    const validacion = validarDatosResena(body, true);
    if (validacion.error) return res.status(400).json({ mensaje: validacion.error });

    try {
        const pelicula = await Pelicula.findByPk(validacion.datos.id_pelicula, { attributes: ['id_pelicula', 'activo'] });
        if (!pelicula) return res.status(404).json({ mensaje: 'La película no existe' });
        if (pelicula.activo !== 1) return res.status(400).json({ mensaje: 'No se pueden crear reseñas para películas inactivas' });

        const existente = await Resena.findOne({
            where: { id_usuario: req.user.id_usuario, id_pelicula: validacion.datos.id_pelicula },
            attributes: ['id_resena']
        });
        if (existente) return res.status(409).json({ mensaje: 'Ya publicaste una reseña para esta película' });

        const resena = await Resena.create({
            id_usuario: req.user.id_usuario,
            ...validacion.datos
        });
        await resena.reload({ attributes: ['id_resena', 'id_usuario', 'id_pelicula', 'frase_destacada', 'contenido', 'puntuacion', 'fecha_creacion', 'fecha_modificacion'], include: [autorInclude] });

        return res.status(201).json({ success: true, mensaje: 'Reseña creada correctamente', resena });
    } catch (error) {
        if (error instanceof UniqueConstraintError) return res.status(409).json({ mensaje: 'Ya publicaste una reseña para esta película' });
        if (error instanceof ForeignKeyConstraintError) return res.status(404).json({ mensaje: 'La película o el usuario no existe' });
        if (error instanceof ValidationError) return res.status(400).json({ mensaje: 'Los datos de la reseña no son válidos' });
        return res.status(500).json({ mensaje: 'No se pudo crear la reseña' });
    }
};

const actualizarResena = async (req, res) => {
    const id = entero(req.params.id);
    if (!idValido(id)) return res.status(400).json({ mensaje: 'La reseña es obligatoria' });
    if (!req.user) return res.status(401).json({ mensaje: 'Esta operación requiere autenticación' });

    const body = req.body || {};
    const validacion = validarDatosResena(body, false);
    if (validacion.error) return res.status(400).json({ mensaje: validacion.error });
    if (Object.prototype.hasOwnProperty.call(body, 'id_pelicula')) {
        return res.status(400).json({ mensaje: 'El campo id_pelicula no se puede modificar' });
    }

    try {
        const resena = await Resena.findByPk(id);
        if (!resena) return res.status(404).json({ mensaje: 'La reseña no existe' });

        const esAdmin = req.user.es_admin === 1 || req.user.es_admin === true;
        if (!esAdmin && resena.id_usuario !== req.user.id_usuario) return res.status(403).json({ mensaje: 'No tiene permisos para editar esta reseña' });

        await resena.update({
            frase_destacada: validacion.datos.frase_destacada,
            contenido: validacion.datos.contenido,
            puntuacion: validacion.datos.puntuacion
        });
        await resena.reload({ attributes: ['id_resena', 'id_usuario', 'id_pelicula', 'frase_destacada', 'contenido', 'puntuacion', 'fecha_creacion', 'fecha_modificacion'], include: [autorInclude] });

        return res.json({ success: true, mensaje: 'Reseña actualizada correctamente', resena });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudo actualizar la reseña' });
    }
};

const eliminarResena = async (req, res) => {
    const id = entero(req.params.id);
    if (!idValido(id)) return res.status(400).json({ mensaje: 'La reseña es obligatoria' });
    if (!req.user) return res.status(401).json({ mensaje: 'Esta operación requiere autenticación' });

    try {
        const resena = await Resena.findByPk(id, { attributes: ['id_resena', 'id_usuario'] });
        if (!resena) return res.status(404).json({ mensaje: 'La reseña no existe' });

        const esAdmin = req.user.es_admin === 1 || req.user.es_admin === true;
        if (!esAdmin && resena.id_usuario !== req.user.id_usuario) return res.status(403).json({ mensaje: 'No tiene permisos para eliminar esta reseña' });

        await resena.destroy();
        return res.json({ success: true, mensaje: 'Reseña eliminada correctamente' });
    } catch {
        return res.status(500).json({ mensaje: 'No se pudo eliminar la reseña' });
    }
};

module.exports = {
    obtenerResenasLanding,
    obtenerResenasPorPelicula,
    obtenerResenasAdmin,
    obtenerResena,
    crearResena,
    actualizarResena,
    eliminarResena
};
