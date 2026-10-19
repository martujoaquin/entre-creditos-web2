const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Genero = sequelize.define('Genero', {
    id_genero: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'generos',
    timestamps: false
});

module.exports = Genero;
