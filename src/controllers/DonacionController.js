const donacionService = require('../services/donacion.service');

async function crearDonacion(req, res, next) {
  try {
    const { donanteNombre, donanteEmail, monto, metodoPago } = req.body;

    const usuarioId = req.usuario.id;

    let comprobante = null;
    if (req.file) {
      comprobante = '/uploads/' + req.file.filename;
    }

    const donacion = await donacionService.crearDonacion({
      donanteNombre,
      donanteEmail,
      monto,
      metodoPago,
      usuarioId,
      comprobante,
    });

    res.status(201).json(donacion);
  } catch (error) {
    next(error);
  }
}

async function listarDonaciones(req, res, next) {
  try {
    const { estado, metodoPago } = req.query;
    const donaciones = await donacionService.listarDonaciones({ estado, metodoPago });
    res.json(donaciones);
  } catch (error) {
    next(error);
  }
}

async function obtenerMetodosPago(req, res, next) {
  try {
    const metodos = await donacionService.obtenerInfoMetodosPago();
    res.json(metodos);
  } catch (error) {
    next(error);
  }
}

async function actualizarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const donacion = await donacionService.actualizarEstado(req.params.id, estado);
    res.json(donacion);
  } catch (error) {
    next(error);
  }
}

async function misDonaciones(req, res, next) {
  try {
    const donaciones = await donacionService.listarDonacionesPorUsuario(req.usuario.id);
    res.json(donaciones);
  } catch (error) {
    next(error);
  }
}

module.exports = { crearDonacion, listarDonaciones, obtenerMetodosPago, actualizarEstado, misDonaciones };
