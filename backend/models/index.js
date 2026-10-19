const Genero = require('./Genero');
const Usuario = require('./Usuario');
const Pelicula = require('./Pelicula');
const Resena = require('./Resena');
const ResenaCompartida = require('./ResenaCompartida');

Genero.hasMany(Pelicula, { foreignKey: 'id_genero', as: 'peliculas' });
Pelicula.belongsTo(Genero, { foreignKey: 'id_genero', as: 'genero' });

Usuario.hasMany(Resena, { foreignKey: 'id_usuario', as: 'resenas' });
Resena.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'autor' });

Pelicula.hasMany(Resena, { foreignKey: 'id_pelicula', as: 'resenas' });
Resena.belongsTo(Pelicula, { foreignKey: 'id_pelicula', as: 'pelicula' });

Resena.hasMany(ResenaCompartida, { foreignKey: 'id_resena', as: 'compartidas' });
ResenaCompartida.belongsTo(Resena, { foreignKey: 'id_resena', as: 'resena' });

Usuario.hasMany(ResenaCompartida, { foreignKey: 'id_usuario_remitente', as: 'resenasCompartidasEnviadas' });
ResenaCompartida.belongsTo(Usuario, { foreignKey: 'id_usuario_remitente', as: 'remitente' });

Usuario.hasMany(ResenaCompartida, { foreignKey: 'id_usuario_destino', as: 'resenasCompartidasRecibidas' });
ResenaCompartida.belongsTo(Usuario, { foreignKey: 'id_usuario_destino', as: 'destinatario' });

module.exports = { Genero, Usuario, Pelicula, Resena, ResenaCompartida };
