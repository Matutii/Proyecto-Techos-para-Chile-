const proyectoService = require('../services/proyecto.service');

// GET /api/proyectos
async function listarProyectos(req, res, next) {
  try {
    const proyectos = await proyectoService.listarProyectos();
    res.json(proyectos);
  } catch (err) {
    next(err);
  }
}

// POST /api/proyectos (admin/coordinador)
async function crearProyecto(req, res, next) {
  try {
    const proyecto = await proyectoService.crearProyecto(req.body);
    res.status(201).json(proyecto);
  } catch (err) {
    next(err);
  }
}

// PUT /api/proyectos/:id (admin/coordinador)
async function actualizarProyecto(req, res, next) {
  try {
    const proyecto = await proyectoService.actualizarProyecto(req.params.id, req.body);
    res.json(proyecto);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarProyectos,
  crearProyecto,
  actualizarProyecto,
};
