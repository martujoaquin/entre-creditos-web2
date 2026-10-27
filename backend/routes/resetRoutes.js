const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { resetDatabase } = require('../controllers/resetController');

const router = express.Router();

// Cuando exista autenticación, esta ruta también deberá protegerse con autorización administrativa.
router.post('/', authMiddleware, adminMiddleware, resetDatabase);

module.exports = router;
