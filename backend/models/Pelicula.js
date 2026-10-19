const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pelicula = sequelize.define('Pelicula', {
    id_pelicula: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: { type: DataTypes.STRING(150), allowNull: false },
    director: { type: DataTypes.STRING(120), allowNull: false },
    // MySQL YEAR se representa como un valor numérico en Sequelize 6.
    anio: { type: DataTypes.INTEGER, allowNull: false },
    sinopsis: { type: DataTypes.TEXT, allowNull: false },
    imagen: { type: DataTypes.STRING(255), allowNull: false },
    id_genero: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    activo: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 }
}, {
    tableName: 'peliculas',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['titulo', 'anio'] }
    ]
});

module.exports = Pelicula;
