const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/donacionController');

router.post('/', verificarToken, upload.single('comprobante'), ctrl.crearDonacion);
router.get('/metodos-pago', ctrl.metodosPago);
router.get('/mis-donaciones', verificarToken, ctrl.misDonaciones);
router.get('/', verificarToken, permitirRoles('admin'), ctrl.listarDonaciones);
router.patch('/:id/estado', verificarToken, permitirRoles('admin'), ctrl.actualizarEstado);

module.exports = router;
