const proyectoService = require('../services/proyecto.service');

async function listarProyectos(req, res, next) {
  try {
    const proyectos = await proyectoService.listarProyectos();
    res.json(proyectos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarProyectos,
};
