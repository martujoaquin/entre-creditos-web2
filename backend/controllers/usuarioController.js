const { UniqueConstraintError } = require('sequelize');
const { Usuario } = require('../models');

const camposPermitidos = ['nombre_completo', 'email', 'es_admin', 'activo'];

const normalizarEnteroBinario = (valor) => {
    if (valor === 0 || valor === 1) return valor;
    if (valor === '0' || valor === '1') return Number(valor);
    return null;
};

const normalizarNombreCompleto = (valor) => valor.replace(/\s+/gu, ' ').trim();

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: ['id_usuario', 'nombre_completo', 'email', 'avatar', 'es_admin', 'activo'],
            order: [['nombre_completo', 'ASC']]
        });

        return res.json({
            success: true,
            usuarios
        });
    } catch {
        return res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

const actualizarUsuario = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ mensaje: 'El usuario no existe' });
    }

    const body = req.body || {};
    const camposRecibidos = Object.keys(body);
    const camposNoPermitidos = camposRecibidos.filter((campo) => !camposPermitidos.includes(campo));

    if (camposNoPermitidos.length > 0) {
        return res.status(400).json({ mensaje: 'Se recibieron campos no permitidos' });
    }

    if (camposRecibidos.length === 0) {
        return res.status(400).json({ mensaje: 'No se recibieron datos para actualizar' });
    }

    const cambios = {};

    if (Object.prototype.hasOwnProperty.call(body, 'nombre_completo')) {
        if (typeof body.nombre_completo !== 'string') {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        cambios.nombre_completo = normalizarNombreCompleto(body.nombre_completo);

        if (cambios.nombre_completo === '') {
            return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
        }

        if (cambios.nombre_completo.length > 100) {
            return res.status(400).json({ mensaje: 'El nombre no puede superar los 100 caracteres' });
        }
    }

    if (Object.prototype.hasOwnProperty.call(body, 'email')) {
        if (typeof body.email !== 'string') {
            return res.status(400).json({ mensaje: 'El email no es válido' });
        }

        cambios.email = body.email.trim();

        if (cambios.email === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cambios.email)) {
            return res.status(400).json({ mensaje: 'El email no es válido' });
        }
    }

    for (const campo of ['es_admin', 'activo']) {
        if (Object.prototype.hasOwnProperty.call(body, campo)) {
            cambios[campo] = normalizarEnteroBinario(body[campo]);

            if (cambios[campo] === null) {
                return res.status(400).json({ mensaje: `El campo ${campo} debe ser 0 o 1` });
            }
        }
    }

    try {
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ mensaje: 'El usuario no existe' });
        }

        if (Object.prototype.hasOwnProperty.call(cambios, 'email')) {
            const usuarioExistente = await Usuario.findOne({
                where: { email: cambios.email }
            });

            if (usuarioExistente && usuarioExistente.id_usuario !== id) {
                return res.status(400).json({ mensaje: 'El email ya está registrado' });
            }
        }

        // En Etapa 6 deberán aplicarse aquí las reglas sobre la propia cuenta del administrador.
        await usuario.update(cambios);

        return res.json({
            success: true,
            mensaje: 'Usuario actualizado correctamente'
        });
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        return res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    }
};

module.exports = {
    obtenerUsuarios,
    actualizarUsuario
};
