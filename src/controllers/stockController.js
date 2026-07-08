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

async function registrarEntrada(req, res, next) {
  try {
    const { cantidad, observacion } = req.body;
    const material = await stockService.registrarEntrada(req.params.id, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function asignarAProyecto(req, res, next) {
  try {
    const { proyectoId, cantidad, observacion } = req.body;
    const material = await stockService.asignarAProyecto(req.params.id, proyectoId, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function retirarStock(req, res, next) {
  try {
    const { cantidad, observacion } = req.body;
    const material = await stockService.retirarStock(req.params.id, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

async function actualizarEnCamino(req, res, next) {
  try {
    const { enCaminoManual } = req.body;
    const material = await stockService.actualizarEnCamino(req.params.id, enCaminoManual);
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
  registrarEntrada,
  asignarAProyecto,
  retirarStock,
  actualizarEnCamino,
  vistaPorProyectos,
};
