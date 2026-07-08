const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const verificarToken = require('../middlewares/auth');
const { soloAccesoBodega } = require('../middlewares/roles');
const { soloUnArchivo } = require('../middlewares/upload');
const ctrl = require('../controllers/DonacionController');
const v = require('../validations/donacionValidations');

const check = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errores: errors.array() });
  next();
};

router.get('/metodos-pago', ctrl.obtenerMetodosPago);

router.get('/mis-donaciones', verificarToken, ctrl.misDonaciones);

router.post('/', verificarToken, soloUnArchivo, v.crearDonacion, check, ctrl.crearDonacion);

router.get('/', verificarToken, soloAccesoBodega, v.listarDonaciones, check, ctrl.listarDonaciones);

router.patch('/:id/estado', verificarToken, soloAccesoBodega, v.actualizarEstado, check, ctrl.actualizarEstado);

module.exports = router;
