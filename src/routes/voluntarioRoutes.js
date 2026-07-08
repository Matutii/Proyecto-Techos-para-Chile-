const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { requiereRol } = require('../middlewares/roles');
const ctrl = require('../controllers/voluntarioController');
const v = require('../validations/voluntarioValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

router.post('/inscripcion', v.inscribir, check, ctrl.inscribirVoluntario);
router.get('/', verificarToken, v.listarVoluntarios, check, ctrl.listarVoluntarios);
router.get('/:id', verificarToken, ctrl.obtenerVoluntario);
router.patch('/:id/estado', verificarToken, requiereRol('admin', 'encargado_cuadrillas'), v.actualizarEstado, check, ctrl.actualizarEstado);

module.exports = router;
