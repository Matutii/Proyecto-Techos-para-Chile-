const multer = require('multer');
const path = require('node:path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'comprobante-' + uniqueSuffix + ext);
    },
});

const fileFilter = function (req, file, cb) {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no válido. Solo se aceptan: ' + allowed.join(', ')));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

function soloUnArchivo(req, res, next) {
    const up = upload.single('comprobante');
    up(req, res, function (err) {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ error: 'El archivo no puede superar los 5 MB' });
                }
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}

module.exports = { upload, soloUnArchivo };
