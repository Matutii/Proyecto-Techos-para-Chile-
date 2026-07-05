const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const ctrl = require('../controllers/proyectoController');

router.get('/', verificarToken, ctrl.listarProyectos);

module.exports = router;
