const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResenaCompartida = sequelize.define('ResenaCompartida', {
    id_compartida: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    id_resena: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_usuario_remitente: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    id_usuario_destino: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    fecha_compartida: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    tableName: 'resenas_compartidas',
    timestamps: false,
    indexes: [
        { unique: true, fields: ['id_resena', 'id_usuario_remitente', 'id_usuario_destino'] }
    ]
});

module.exports = ResenaCompartida;
