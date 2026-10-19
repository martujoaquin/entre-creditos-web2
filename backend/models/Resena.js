const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resena = sequelize.define('Resena', {
    id_resena: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_pelicula: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    frase_destacada: { type: DataTypes.STRING(220), allowNull: true },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    puntuacion: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        validate: { min: 1, max: 5 }
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    fecha_modificacion: { type: DataTypes.DATE, allowNull: true, defaultValue: null }
}, {
    tableName: 'resenas',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['id_usuario', 'id_pelicula'] }
    ]
});

module.exports = Resena;
