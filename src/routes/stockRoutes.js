const router = require('express').Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { soloAccesoBodega, requiereRol } = require('../middlewares/roles');
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
router.post('/:id/entrada', verificarToken, soloAccesoBodega, v.registrarEntrada, check, ctrl.registrarEntrada);
router.post('/:id/asignar', verificarToken, soloAccesoBodega, v.asignarAProyecto, check, ctrl.asignarAProyecto);
router.patch('/:id/retiro', verificarToken, requiereRol('admin', 'coordinador_logistica', 'colaborador'), v.retirarStock, check, ctrl.retirarStock);
router.patch('/:id/en-camino', verificarToken, soloAccesoBodega, v.actualizarEnCamino, check, ctrl.actualizarEnCamino);

module.exports = router;
