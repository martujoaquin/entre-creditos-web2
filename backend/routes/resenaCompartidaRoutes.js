const express = require('express');
const {
    obtenerUsuariosDisponibles,
    obtenerCompartidas,
    compartirResena
} = require('../controllers/resenaCompartidaController');

const router = express.Router();

router.get('/usuarios/compartir', obtenerUsuariosDisponibles);
router.get('/resenas-compartidas', obtenerCompartidas);
router.post('/resenas-compartidas', compartirResena);

module.exports = router;
