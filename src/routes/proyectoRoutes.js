// Rutas de proyectos. Lectura autenticada; crear/editar solo bodega y admin.
const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { soloAccesoBodega } = require('../middlewares/roles');
const ctrl = require('../controllers/proyectoController');
const v = require('../validations/proyectoValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

router.get('/', verificarToken, ctrl.listarProyectos);
router.post('/', verificarToken, soloAccesoBodega, v.crearProyecto, check, ctrl.crearProyecto);
router.put('/:id', verificarToken, soloAccesoBodega, v.actualizarProyecto, check, ctrl.actualizarProyecto);

module.exports = router;
