const multer = require('multer');
const path = require('path');

const tiposPermitidos = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase().replace('.', '');
        const extensionEsperada = tiposPermitidos[file.mimetype];

        const extensionValida = extensionEsperada === 'jpg'
            ? extension === 'jpg' || extension === 'jpeg'
            : extension === extensionEsperada;

        if (!extensionEsperada || !extensionValida) {
            return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'imagen'));
        }

        return callback(null, true);
    }
});

module.exports = { upload, tiposPermitidos };
