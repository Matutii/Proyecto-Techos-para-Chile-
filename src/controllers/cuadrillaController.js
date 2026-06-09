const svc = require('../services/cuadrilla.service');

// GET /api/cuadrillas - Lista todas las cuadrillas
async function listarCuadrillas(req, res, next) {
  try {
    const filtros = {};
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.especialidad) filtros.especialidad = req.query.especialidad;

    const cuadrillas = await svc.listarCuadrillas(filtros);
    res.json(cuadrillas);
  } catch (err) {
    next(err);
  }
}

// GET /api/cuadrillas/:id - Obtiene una cuadrilla por ID
async function obtenerCuadrilla(req, res, next) {
  try {
    const cuadrilla = await svc.obtenerCuadrilla(req.params.id);
    res.json(cuadrilla);
  } catch (err) {
    if (err.message === 'Cuadrilla no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

// POST /api/cuadrillas - Crea una nueva cuadrilla
async function crearCuadrilla(req, res, next) {
  try {
    const cuadrilla = await svc.crearCuadrilla(req.body);
    res.status(201).json(cuadrilla);
  } catch (err) {
    if (err.message === 'Ya existe una cuadrilla con ese nombre') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

// PUT /api/cuadrillas/:id - Actualiza una cuadrilla existente
async function actualizarCuadrilla(req, res, next) {
  try {
    const cuadrilla = await svc.actualizarCuadrilla(req.params.id, req.body);
    res.json(cuadrilla);
  } catch (err) {
    if (err.message === 'Cuadrilla no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Ya existe una cuadrilla con ese nombre') {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
}

// DELETE /api/cuadrillas/:id - Elimina una cuadrilla
async function eliminarCuadrilla(req, res, next) {
  try {
    await svc.eliminarCuadrilla(req.params.id);
    res.json({ mensaje: 'Cuadrilla eliminada correctamente' });
  } catch (err) {
    if (err.message === 'Cuadrilla no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

// POST /api/cuadrillas/:id/voluntarios - Agrega un voluntario a la cuadrilla
async function agregarVoluntario(req, res, next) {
  try {
    const asignacion = await svc.agregarVoluntario(req.params.id, req.body.voluntarioId);
    res.status(201).json(asignacion);
  } catch (err) {
    if (err.message === 'Cuadrilla no encontrada') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'El voluntario ya está asignado a esta cuadrilla') {
      return res.status(409).json({ error: err.message });
    }
    if (err.message === 'No se pueden agregar voluntarios a una cuadrilla disuelta') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}

module.exports = {
  listarCuadrillas,
  obtenerCuadrilla,
  crearCuadrilla,
  actualizarCuadrilla,
  eliminarCuadrilla,
  agregarVoluntario,
};
