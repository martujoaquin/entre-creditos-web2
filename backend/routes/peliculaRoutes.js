const express = require('express');
const { obtenerPeliculas, crearPelicula, actualizarPelicula } = require('../controllers/peliculaController');
const { upload } = require('../middleware/peliculaUpload');
const multer = require('multer');

const router = express.Router();

router.get('/', obtenerPeliculas);
const recibirImagen = (req, res, next) => upload.single('imagen')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ mensaje: 'La imagen supera el tamaño máximo permitido' });
    }
    return res.status(400).json({ mensaje: 'El formato de imagen no es válido' });
});

router.post('/', recibirImagen, crearPelicula);
router.patch('/:id', recibirImagen, actualizarPelicula);

module.exports = router;
