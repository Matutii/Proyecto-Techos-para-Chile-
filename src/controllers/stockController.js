const stockService = require('../services/stock.service');

// GET /api/stock
// Lista materiales con su estado calculado; admite filtros ?estado= y ?proyectoId=
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

// GET /api/stock/:id
// Devuelve un material con su historial completo de movimientos
async function obtenerMaterial(req, res, next) {
  try {
    const material = await stockService.obtenerMaterial(req.params.id);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

// POST /api/stock
// Crea un material; si trae cantidad inicial queda registrada como entrada
async function crearMaterial(req, res, next) {
  try {
    const material = await stockService.crearMaterial(req.body, req.usuario.id);
    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
}

// PUT /api/stock/:id
// Edita nombre, descripción y/o umbral (la cantidad solo cambia por movimientos)
async function actualizarMaterial(req, res, next) {
  try {
    const material = await stockService.actualizarMaterial(req.params.id, req.body);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

// POST /api/stock/:id/entrada
// Suma unidades al stock general
async function registrarEntrada(req, res, next) {
  try {
    const { cantidad, observacion } = req.body;
    const material = await stockService.registrarEntrada(req.params.id, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

// POST /api/stock/:id/asignar
// Descuenta del stock general y lo asigna a un proyecto
async function asignarAProyecto(req, res, next) {
  try {
    const { proyectoId, cantidad, observacion } = req.body;
    const material = await stockService.asignarAProyecto(req.params.id, proyectoId, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/stock/:id/retiro
// Retiro en terreno; valida que haya stock suficiente
async function retirarStock(req, res, next) {
  try {
    const { cantidad, observacion } = req.body;
    const material = await stockService.retirarStock(req.params.id, cantidad, req.usuario.id, observacion);
    res.json(material);
  } catch (err) {
    next(err);
  }
}

// GET /api/stock/proyectos
// Detalle de materiales asignados agrupados por proyecto
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
  actualizarMaterial,
  registrarEntrada,
  asignarAProyecto,
  retirarStock,
  vistaPorProyectos,
};
