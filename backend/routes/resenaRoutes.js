const express = require('express');
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

router.get('/', obtenerResenasPorPelicula);
router.get('/landing', obtenerResenasLanding);
router.get('/admin', obtenerResenasAdmin);
router.get('/:id', obtenerResena);
router.post('/', crearResena);
router.patch('/:id', actualizarResena);
router.delete('/:id', eliminarResena);

module.exports = router;
