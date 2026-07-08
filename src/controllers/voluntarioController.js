const voluntarioService = require('../services/voluntario.service');

// POST /api/voluntarios/inscripcion (público)
// Inscribe un voluntario; queda Pendiente hasta que lo apruebe un encargado
async function inscribirVoluntario(req, res, next) {
  try {
    const voluntario = await voluntarioService.inscribirVoluntario(req.body);
    res.status(201).json(voluntario);
  } catch (err) {
    next(err);
  }
}

// GET /api/voluntarios
// Admite filtros ?estado= y ?especialidad=
async function listarVoluntarios(req, res, next) {
  try {
    const voluntarios = await voluntarioService.listarVoluntarios({
      estado: req.query.estado,
      especialidad: req.query.especialidad,
    });
    res.json(voluntarios);
  } catch (err) {
    next(err);
  }
}

// GET /api/voluntarios/:id
async function obtenerVoluntario(req, res, next) {
  try {
    const voluntario = await voluntarioService.obtenerVoluntario(req.params.id);
    res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/voluntarios/:id/estado (admin/encargado_cuadrillas)
// Aprueba (Activo) o rechaza (Rechazado) a un voluntario
async function actualizarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    const voluntario = await voluntarioService.actualizarEstado(req.params.id, estado);
    res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inscribirVoluntario,
  listarVoluntarios,
  obtenerVoluntario,
  actualizarEstado,
};
