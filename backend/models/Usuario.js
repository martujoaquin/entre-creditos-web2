const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_completo: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    es_admin: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'uploads/avatars/default-avatar.png'
    },
    activo: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1
    },
    fecha_registro: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    tableName: 'usuarios',
    timestamps: false
});

module.exports = Usuario;
