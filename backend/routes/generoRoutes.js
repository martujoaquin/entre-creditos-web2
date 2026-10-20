const express = require('express');
const {
    obtenerGeneros,
    crearGenero,
    actualizarGenero,
    eliminarGenero
} = require('../controllers/generoController');

const router = express.Router();

router.get('/', obtenerGeneros);
router.post('/', crearGenero);
router.patch('/:id', actualizarGenero);
router.delete('/:id', eliminarGenero);

module.exports = router;
