const stockService = require('../services/stock.service');

async function listarMateriales(req, res, next) {
  try {
    const materiales = await stockService.listarMateriales({
      estado: req.query.estado,
      proyectoId: req.query.proyectoId,
    });
    res.json(materiales);
  } catch (err) {
    next(err);
  }
}

async function obtenerMaterial(req, res, next) {
  try {
    const material = await stockService.obtenerMaterial(req.params.id);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function crearMaterial(req, res, next) {
  try {
    const material = await stockService.crearMaterial(req.body, req.usuario.id);
    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
}

async function actualizarEstado(req, res, next) {
  try {
    const { estado, observacion } = req.body;
    const material = await stockService.actualizarEstado(req.params.id, estado, observacion, req.usuario.id);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function vistaPorProyectos(req, res, next) {
  try {
    const proyectos = await stockService.vistaPorProyectos();
    res.json({ proyectos });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarMateriales,
  obtenerMaterial,
  crearMaterial,
  actualizarEstado,
  vistaPorProyectos,
};
