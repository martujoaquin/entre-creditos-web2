const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    obtenerGeneros,
    crearGenero,
    actualizarGenero,
    eliminarGenero
} = require('../controllers/generoController');

const router = express.Router();

router.get('/', authMiddleware, obtenerGeneros);
router.post('/', authMiddleware, adminMiddleware, crearGenero);
router.patch('/:id', authMiddleware, adminMiddleware, actualizarGenero);
router.delete('/:id', authMiddleware, adminMiddleware, eliminarGenero);

module.exports = router;
