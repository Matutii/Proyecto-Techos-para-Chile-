const { body, param } = require('express-validator');

const crearProyecto = [
  body('nombre').isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional().isString().trim().isLength({ max: 2000 }),
  body('estado').optional().isIn(['activo', 'pausado', 'finalizado']),
];

const actualizarProyecto = [
  param('id').isInt({ min: 1 }),
  body('nombre').optional().isString().trim().isLength({ min: 3, max: 200 }),
  body('descripcion').optional({ values: 'null' }).isString().trim().isLength({ max: 2000 }),
  body('estado').optional().isIn(['activo', 'pausado', 'finalizado']),
];

module.exports = { crearProyecto, actualizarProyecto };
