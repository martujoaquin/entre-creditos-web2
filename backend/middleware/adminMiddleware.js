function adminMiddleware(req, res, next) {
    if (!req.user || req.user.es_admin !== 1) {
        return res.status(403).json ({
            success: false,
            mensaje: 'Se requieren permisos de administrador'
        });
    }

    next();
}

module.exports = adminMiddleware;