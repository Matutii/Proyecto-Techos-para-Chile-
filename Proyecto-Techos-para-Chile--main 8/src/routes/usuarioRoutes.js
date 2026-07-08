const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const ctrl = require('../controllers/usuarioController');

// Todo este módulo es exclusivo del administrador
router.use(verificarToken, permitirRoles('admin'));

router.get('/', ctrl.listarUsuarios);
router.post('/', ctrl.crearUsuario);
router.patch('/:id', ctrl.actualizarUsuario);

module.exports = router;
