const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const ctrl = require('../controllers/stockController');

// Ver la bodega: cualquier rol interno (todos menos visitante)
router.get('/', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas'), ctrl.listarMateriales);
router.get('/:id', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas'), ctrl.obtenerMaterial);

// Crear materiales y cambiar su estado libremente: solo admin y bodega
router.post('/', verificarToken, permitirRoles('admin', 'coordinador_logistica'), ctrl.crearMaterial);
router.patch('/:id/estado', verificarToken, permitirRoles('admin', 'coordinador_logistica'), ctrl.actualizarEstado);

// Retirar un material: admin, bodega y colaborador
router.patch('/:id/retiro', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'colaborador'), ctrl.retirarMaterial);

module.exports = router;
