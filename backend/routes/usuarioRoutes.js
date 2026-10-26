const express = require('express');
const { obtenerUsuarios, actualizarUsuario } = require('../controllers/usuarioController');

const router = express.Router();

router.get('/', obtenerUsuarios);
router.patch('/:id', actualizarUsuario);

module.exports = router;
