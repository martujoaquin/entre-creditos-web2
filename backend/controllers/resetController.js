const fs = require('fs/promises');
const path = require('path');
const sequelize = require('../config/database');
const { Genero, Usuario, Pelicula, Resena, ResenaCompartida } = require('../models');

const generosIniciales = [
    { id_genero: 1, nombre: 'Acción' },
    { id_genero: 2, nombre: 'Animación' },
    { id_genero: 3, nombre: 'Ciencia ficción' },
    { id_genero: 4, nombre: 'Comedia' },
    { id_genero: 5, nombre: 'Crimen' },
    { id_genero: 6, nombre: 'Drama' },
    { id_genero: 7, nombre: 'Fantasía' },
    { id_genero: 8, nombre: 'Terror' },
    { id_genero: 9, nombre: 'Thriller' }
];

const imagenesGeneradas = /^pelicula_[a-f0-9]{16}\.(jpg|jpeg|png|webp)$/;
const directorioImagenes = path.resolve(__dirname, '../uploads/peliculas');

const limpiarImagenesGeneradas = async () => {
    const archivos = await fs.readdir(directorioImagenes, { withFileTypes: true });

    await Promise.all(
        archivos
            .filter((archivo) => archivo.isFile() && imagenesGeneradas.test(archivo.name))
            .map((archivo) => fs.unlink(path.join(directorioImagenes, archivo.name)))
    );
};

const resetDatabase = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ mensaje: 'El reset está bloqueado en producción' });
    }

    if (req.body?.confirmacion !== 'RESET') {
        return res.status(400).json({ mensaje: 'Confirmación inválida' });
    }

    let transaction;
    let foreignKeysDeshabilitadas = false;

    try {
        transaction = await sequelize.transaction();

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
        foreignKeysDeshabilitadas = true;

        await ResenaCompartida.destroy({ where: {}, transaction });
        await Resena.destroy({ where: {}, transaction });
        await Pelicula.destroy({ where: {}, transaction });
        await Usuario.destroy({ where: {}, transaction });
        await Genero.destroy({ where: {}, transaction });

        await Genero.bulkCreate(generosIniciales, { transaction });
        await Usuario.create({
            id_usuario: 1,
            nombre_completo: 'Administrador Entre Créditos',
            email: 'admin@entrecreditos.com',
            password_hash: '$2y$12$JPat0S/gAwbPVrU53JYoS.N7NG1cvkKym0/N7Ez7nYvGB/G6mKULi',
            es_admin: 1,
            activo: 1
        }, { transaction });

        await sequelize.query('ALTER TABLE resenas_compartidas AUTO_INCREMENT = 1', { transaction });
        await sequelize.query('ALTER TABLE resenas AUTO_INCREMENT = 1', { transaction });
        await sequelize.query('ALTER TABLE peliculas AUTO_INCREMENT = 1', { transaction });
        await sequelize.query('ALTER TABLE usuarios AUTO_INCREMENT = 2', { transaction });
        await sequelize.query('ALTER TABLE generos AUTO_INCREMENT = 10', { transaction });

        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
        foreignKeysDeshabilitadas = false;
        await transaction.commit();
    } catch (error) {
        if (transaction) {
            if (foreignKeysDeshabilitadas) {
                try {
                    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
                } catch {
                    // Se intenta restaurar nuevamente al liberar la transacción.
                }
            }

            try {
                await transaction.rollback();
            } catch {
                // La respuesta de error no debe ocultarse por un fallo de rollback.
            }
        }

        return res.status(500).json({ mensaje: 'No se pudo restaurar la base de datos' });
    }

    try {
        await limpiarImagenesGeneradas();
    } catch {
        return res.status(500).json({ mensaje: 'La base fue restaurada, pero no se pudieron limpiar todas las imágenes de prueba' });
    }

    return res.status(200).json({ mensaje: 'Base de datos restaurada correctamente' });
};

module.exports = { resetDatabase };
