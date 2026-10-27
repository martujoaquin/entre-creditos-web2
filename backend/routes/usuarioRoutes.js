const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { obtenerUsuarios, actualizarUsuario } = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, obtenerUsuarios);
router.patch('/:id', authMiddleware, adminMiddleware, actualizarUsuario);

module.exports = router;
