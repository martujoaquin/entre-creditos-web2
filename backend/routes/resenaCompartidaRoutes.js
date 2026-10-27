const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
    obtenerUsuariosDisponibles,
    obtenerCompartidas,
    compartirResena
} = require('../controllers/resenaCompartidaController');

const router = express.Router();

router.get('/usuarios/compartir', authMiddleware, obtenerUsuariosDisponibles);
router.get('/resenas-compartidas', authMiddleware, obtenerCompartidas);
router.post('/resenas-compartidas', authMiddleware, compartirResena);

module.exports = router;
