const { body, query, param } = require('express-validator');

const crearCuadrilla = [
  body('nombre').isString().trim().isLength({ min: 3, max: 200 }),
  body('especialidad').isIn(['fuerza_general', 'tecnico', 'logistica']),
  body('estado').optional().isIn(['En_formacion', 'Lista_para_asignacion', 'Disuelta']),
  body('jefeCuadrillaId').optional().isInt({ min: 1 }),
  body('proyectoId').optional().isInt({ min: 1 }),
];

const actualizarCuadrilla = [
  body('nombre').optional().isString().trim().isLength({ min: 3, max: 200 }),
  body('especialidad').optional().isIn(['fuerza_general', 'tecnico', 'logistica']),
  body('estado').optional().isIn(['En_formacion', 'Lista_para_asignacion', 'Disuelta']),
  body('jefeCuadrillaId').optional({ values: 'null' }).isInt({ min: 1 }),
  body('proyectoId').optional({ values: 'null' }).isInt({ min: 1 }),
];

const listarCuadrillas = [
  query('estado').optional().isIn(['En_formacion', 'Lista_para_asignacion', 'Disuelta']),
  query('especialidad').optional().isIn(['fuerza_general', 'tecnico', 'logistica']),
];

const obtenerCuadrilla = [
  param('id').isInt({ min: 1 }),
];

const eliminarCuadrilla = [
  param('id').isInt({ min: 1 }),
];

const agregarVoluntario = [
  param('id').isInt({ min: 1 }),
  body('voluntarioId').isInt({ min: 1 }),
];

module.exports = {
  crearCuadrilla,
  actualizarCuadrilla,
  listarCuadrillas,
  obtenerCuadrilla,
  eliminarCuadrilla,
  agregarVoluntario,
};
