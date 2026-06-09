const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { soloAdmin, requiereRol } = require('../middlewares/roles');
const ctrl = require('../controllers/cuadrillaController');
const v = require('../validations/cuadrillaValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

router.get('/', verificarToken, v.listarCuadrillas, check, ctrl.listarCuadrillas);
router.get('/:id', verificarToken, v.obtenerCuadrilla, check, ctrl.obtenerCuadrilla);
router.post('/', verificarToken, requiereRol('admin', 'coordinador_logistica'), v.crearCuadrilla, check, ctrl.crearCuadrilla);
router.put('/:id', verificarToken, requiereRol('admin', 'coordinador_logistica'), v.actualizarCuadrilla, check, ctrl.actualizarCuadrilla);
router.delete('/:id', verificarToken, soloAdmin, v.eliminarCuadrilla, check, ctrl.eliminarCuadrilla);
router.post('/:id/voluntarios', verificarToken, requiereRol('admin', 'coordinador_logistica'), v.agregarVoluntario, check, ctrl.agregarVoluntario);

module.exports = router;
