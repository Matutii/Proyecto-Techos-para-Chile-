const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { requiereRol } = require('../middlewares/roles');
const ctrl = require('../controllers/usuarioController');
const v = require('../validations/usuarioValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

// Todo este módulo es exclusivo del administrador
router.use(verificarToken, requiereRol('admin'));

router.get('/', ctrl.listarUsuarios);
router.post('/', v.crearUsuario, check, ctrl.crearUsuario);
router.patch('/:id', v.actualizarUsuario, check, ctrl.actualizarUsuario);

module.exports = router;
