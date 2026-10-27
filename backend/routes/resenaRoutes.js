const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    obtenerResenasLanding,
    obtenerResenasPorPelicula,
    obtenerResenasAdmin,
    obtenerResena,
    crearResena,
    actualizarResena,
    eliminarResena
} = require('../controllers/resenaController');

const router = express.Router({ mergeParams: true });

router.get('/', authMiddleware, obtenerResenasPorPelicula);
router.get('/landing', obtenerResenasLanding);
router.get('/admin', authMiddleware, adminMiddleware, obtenerResenasAdmin);
router.get('/:id', authMiddleware, obtenerResena);
router.post('/', authMiddleware, crearResena);
router.patch('/:id', authMiddleware, actualizarResena);
router.delete('/:id', authMiddleware, eliminarResena);

module.exports = router;
