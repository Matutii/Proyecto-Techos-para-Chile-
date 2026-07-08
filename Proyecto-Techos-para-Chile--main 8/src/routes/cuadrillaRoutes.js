const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const ctrl = require('../controllers/cuadrillaController');

// Ver cuadrillas: cualquier rol interno
router.get('/', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas'), ctrl.listarCuadrillas);
router.get('/mi-cuadrilla', verificarToken, ctrl.miCuadrilla);
router.get('/:id', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas'), ctrl.obtenerCuadrilla);

// Gestionar cuadrillas: solo admin y encargado_cuadrillas
router.post('/', verificarToken, permitirRoles('admin', 'encargado_cuadrillas'), ctrl.crearCuadrilla);
router.put('/:id', verificarToken, permitirRoles('admin', 'encargado_cuadrillas'), ctrl.actualizarCuadrilla);
router.post('/:id/voluntarios', verificarToken, permitirRoles('admin', 'encargado_cuadrillas'), ctrl.agregarVoluntario);

// Eliminar: solo admin
router.delete('/:id', verificarToken, permitirRoles('admin'), ctrl.eliminarCuadrilla);

module.exports = router;
