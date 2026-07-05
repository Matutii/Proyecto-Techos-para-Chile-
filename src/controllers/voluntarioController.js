const voluntarioService = require('../services/voluntario.service');

async function inscribirVoluntario(req, res, next) {
  try {
    const voluntario = await voluntarioService.inscribirVoluntario(req.body);
    res.status(201).json(voluntario);
  } catch (err) {
    next(err);
  }
}

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

async function obtenerVoluntario(req, res, next) {
  try {
    const voluntario = await voluntarioService.obtenerVoluntario(req.params.id);
    res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  inscribirVoluntario,
  listarVoluntarios,
  obtenerVoluntario,
};
