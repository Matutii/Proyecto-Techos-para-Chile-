const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { soloAccesoBodega } = require('../middlewares/roles');
const ctrl = require('../controllers/donacionController');
const v = require('../validations/donacionValidations');

// Middleware reutilizable para reportar errores de validación
const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

// GET /api/donaciones/metodos-pago
// Público — no requiere token
router.get('/metodos-pago', ctrl.obtenerMetodosPago);

// POST /api/donaciones
// Público — cualquiera puede registrar una donación
router.post('/', v.crearDonacion, check, ctrl.crearDonacion);

// GET /api/donaciones
// Privado — solo admin y coordinador_logistica
router.get('/', verificarToken, soloAccesoBodega, v.listarDonaciones, check, ctrl.listarDonaciones);

module.exports = router;