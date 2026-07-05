const { body, query } = require('express-validator');

const crearMaterial = [
  body('nombre').isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional().isString().isLength({ max: 1000 }),
  body('umbralBajoStock').isInt({ min: 0 }),
  body('cantidadDisponible').optional().isInt({ min: 0 }),
];

const registrarEntrada = [
  body('cantidad').isInt({ min: 1 }),
  body('observacion').optional().isString().isLength({ max: 500 }),
];

const asignarAProyecto = [
  body('proyectoId').isInt(),
  body('cantidad').isInt({ min: 1 }),
  body('observacion').optional().isString().isLength({ max: 500 }),
];

const actualizarEnCamino = [
  body('enCaminoManual').isBoolean(),
  body('observacion').optional().isString().isLength({ max: 500 }),
];

const listarStock = [
  query('estado').optional().isIn(['Disponible', 'Bajo_Stock', 'Agotado', 'En_camino']),
  query('proyectoId').optional().isInt(),
];

module.exports = {
  crearMaterial,
  registrarEntrada,
  asignarAProyecto,
  actualizarEnCamino,
  listarStock,
};
