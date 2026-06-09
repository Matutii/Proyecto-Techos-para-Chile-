const { body, query } = require('express-validator');

const crearMaterial = [
  body('nombre').isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional().isString().isLength({ max: 1000 }),
  body('estado').optional().isIn(['Disponible', 'Agotado', 'En_camino']),
  body('proyectoId').optional().isInt(),
];

const actualizarEstado = [
  body('estado').isIn(['Disponible', 'Agotado', 'En_camino']),
  body('observacion').optional().isString().isLength({ max: 500 }),
];

const listarStock = [
  query('estado').optional().isIn(['Disponible', 'Agotado', 'En_camino']),
  query('proyectoId').optional().isInt(),
];

module.exports = { crearMaterial, actualizarEstado, listarStock };
