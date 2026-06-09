const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth.mjs').default;
const { soloAccesoBodega } = require('../middlewares/roles');
const ctrl = require('../controllers/stockController');
const v = require('../validations/stockValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

router.get('/', verificarToken, v.listarStock, check, ctrl.listarMateriales);
router.get('/proyectos', verificarToken, ctrl.vistaPorProyectos);
router.get('/:id', verificarToken, ctrl.obtenerMaterial);
router.post('/', verificarToken, soloAccesoBodega, v.crearMaterial, check, ctrl.crearMaterial);
router.patch('/:id/estado', verificarToken, soloAccesoBodega, v.actualizarEstado, check, ctrl.actualizarEstado);

module.exports = router;
