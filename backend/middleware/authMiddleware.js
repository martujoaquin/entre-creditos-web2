const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function authMiddleware(req, res, next) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                mensaje: 'Se requiere autenticación'
            });
        }

        const token = authorization.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findByPk(decoded.id_usuario, {
            attributes: [
                'id_usuario',
                'nombre_completo',
                'email',
                'es_admin',
                'avatar',
                'activo',
                'fecha_registro'
            ]
        });

        if (!usuario || usuario.activo !== 1) {
            return res.status(401).json({
                success: false,
                mensaje: 'Usuario no autorizado'
            });
        }

        req.user = usuario;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            mensaje: 'Token inválido o expirado'
        });
    }
}

module.exports = authMiddleware;