const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const permitirRoles = require('../middlewares/roles');
const ctrl = require('../controllers/voluntarioController');

// Público: cualquiera puede postular como voluntario
router.post('/inscripcion', ctrl.inscribirVoluntario);

// Ver voluntarios: solo el personal que gestiona cuadrillas/bodega
router.get('/', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'encargado_cuadrillas'), ctrl.listarVoluntarios);
router.get('/:id', verificarToken, permitirRoles('admin', 'coordinador_logistica', 'encargado_cuadrillas'), ctrl.obtenerVoluntario);

module.exports = router;
