const router = require('express').Router();
const verificarToken = require('../middlewares/auth');
const ctrl = require('../controllers/authController');

// Público: iniciar sesión
router.post('/login', ctrl.login);

// Público: crear una cuenta de visitante
router.post('/registro', ctrl.registro);

// Privado: ver mis propios datos (para recargar la sesión)
router.get('/perfil', verificarToken, ctrl.perfil);

module.exports = router;
