const donacionService = require('../services/donacion.service');

// POST /api/donaciones
// Público — cualquiera puede registrar una donación
async function crearDonacion(req, res, next) {
  try {
    const { donanteNombre, donanteEmail, monto, metodoPago } = req.body;

    // Si hay usuario autenticado (token opcional), se vincula la donación
    const usuarioId = req.usuario?.id || null;

    const donacion = await donacionService.crearDonacion({
      donanteNombre,
      donanteEmail,
      monto,
      metodoPago,
      usuarioId,
    });

    res.status(201).json(donacion);
  } catch (error) {
    next(error);
  }
}

// GET /api/donaciones
// Privado — requiere token (admin o coordinador_logistica)
async function listarDonaciones(req, res, next) {
  try {
    const { estado, metodoPago } = req.query;

    const donaciones = await donacionService.listarDonaciones({ estado, metodoPago });

    res.json(donaciones);
  } catch (error) {
    next(error);
  }
}

// GET /api/donaciones/metodos-pago
// Público — información de métodos de pago disponibles
async function obtenerMetodosPago(req, res, next) {
  try {
    const metodos = await donacionService.obtenerInfoMetodosPago();
    res.json(metodos);
  } catch (error) {
    next(error);
  }
}

module.exports = { crearDonacion, listarDonaciones, obtenerMetodosPago };