const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const ctrl = require('../controllers/horasController');

router.get('/proyectos', verificarToken, ctrl.listarProyectos);
router.post('/', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas'), ctrl.registrarHoras);
router.get('/proyecto/:id', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'encargado_cuadrillas'), ctrl.horasPorProyecto);
router.get('/mis-registros', verificarToken, ctrl.misRegistros);

module.exports = router;
