const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'entre_creditos',
    'root',
    '',
    {
        host: '127.0.0.1',
        port: 3307,
        dialect: 'mysql',
        logging: false
    }
);

module.exports = sequelize;