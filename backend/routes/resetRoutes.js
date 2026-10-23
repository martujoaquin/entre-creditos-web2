const express = require('express');
const { resetDatabase } = require('../controllers/resetController');

const router = express.Router();

// Cuando exista autenticación, esta ruta también deberá protegerse con autorización administrativa.
router.post('/', resetDatabase);

module.exports = router;
