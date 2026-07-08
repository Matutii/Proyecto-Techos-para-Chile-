// Reglas de validación para materiales y movimientos de stock
const { body, query, param } = require('express-validator');

const crearMaterial = [
  body('nombre').isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional().isString().isLength({ max: 1000 }),
  body('umbralBajoStock').isInt({ min: 0 }),
  body('cantidadDisponible').optional().isInt({ min: 0 }),
];

const actualizarMaterial = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional({ values: 'null' }).isString().isLength({ max: 1000 }),
  body('umbralBajoStock').optional().isInt({ min: 0 }),
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

const retirarStock = [
  body('cantidad').isInt({ min: 1 }),
  body('observacion').optional().isString().isLength({ max: 500 }),
];

const listarStock = [
  query('estado').optional().isIn(['Disponible', 'Bajo_Stock', 'Agotado']),
  query('proyectoId').optional().isInt(),
];

module.exports = {
  crearMaterial,
  actualizarMaterial,
  registrarEntrada,
  asignarAProyecto,
  retirarStock,
  listarStock,
};
