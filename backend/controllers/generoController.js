const { Genero } = require('../models');
const { UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');

const obtenerGeneros = async (req, res) => {
    try {
        const generos = await Genero.findAll();

        res.json(generos);
    } catch {
        res.status(500).json({
            mensaje: 'Error al obtener los géneros'
        });
    }
};

const crearGenero = async (req, res) => {
    const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';

    if (nombre === '') {
        return res.status(400).json({ mensaje: 'El nombre del género es obligatorio' });
    }

    try {
        const generoExistente = await Genero.findOne({ where: { nombre } });

        if (generoExistente) {
            return res.status(409).json({ mensaje: 'El género ya existe' });
        }

        const genero = await Genero.create({ nombre });

        return res.status(201).json(genero);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ mensaje: 'El género ya existe' });
        }

        return res.status(500).json({ mensaje: 'Error al crear el género' });
    }
};

const actualizarGenero = async (req, res) => {
    const id = Number(req.params.id);
    const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';

    if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ mensaje: 'El género no existe' });
    }

    if (nombre === '') {
        return res.status(400).json({ mensaje: 'El nombre del género es obligatorio' });
    }

    try {
        const genero = await Genero.findByPk(id);

        if (!genero) {
            return res.status(404).json({ mensaje: 'El género no existe' });
        }

        const generoExistente = await Genero.findOne({ where: { nombre } });

        if (generoExistente && generoExistente.id_genero !== id) {
            return res.status(409).json({ mensaje: 'El género ya existe' });
        }

        genero.nombre = nombre;
        await genero.save();

        return res.json(genero);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({ mensaje: 'El género ya existe' });
        }

        return res.status(500).json({ mensaje: 'Error al actualizar el género' });
    }
};

const eliminarGenero = async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(404).json({ mensaje: 'El género no existe' });
    }

    try {
        const genero = await Genero.findByPk(id);

        if (!genero) {
            return res.status(404).json({ mensaje: 'El género no existe' });
        }

        await genero.destroy();

        return res.json({ mensaje: 'Género eliminado correctamente' });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            return res.status(409).json({
                mensaje: 'No se puede eliminar el género porque está asociado a una película'
            });
        }

        return res.status(500).json({ mensaje: 'Error al eliminar el género' });
    }
};

module.exports = {
    obtenerGeneros,
    crearGenero,
    actualizarGenero,
    eliminarGenero
};
