const { body, query, param } = require('express-validator');

const inscribir = [
  body('nombre').isString().trim().isLength({ min: 3, max: 100 }),
  body('apellido').isString().trim().isLength({ min: 3, max: 100 }),
  body('email').isEmail(),
  body('telefono').optional().isString().isLength({ min: 6, max: 20 }),
  body('datosMedicos').isString().isLength({ min: 5, max: 1000 }),
  body('contactoEmergenciaNombre').isString().trim().isLength({ min: 3, max: 100 }),
  body('contactoEmergenciaTelefono').isString().isLength({ min: 6, max: 20 }),
  body('terminosAceptados')
    .custom((v) => v === true)
    .withMessage('Debe aceptar los términos'),
  body('experienciaAnos').optional().isInt({ min: 0, max: 70 }),
  body('habilidades').optional().isString().isLength({ max: 1000 }),
];

const listarVoluntarios = [
  query('estado').optional().isIn(['Pendiente', 'Activo', 'Rechazado']),
  query('especialidad').optional().isIn(['fuerza_general', 'tecnico', 'jefe_cuadrilla']),
];

const actualizarEstado = [
  param('id').isInt({ min: 1 }),
  body('estado')
    .isIn(['Pendiente', 'Activo', 'Rechazado'])
    .withMessage('Estado inválido. Use: Pendiente, Activo o Rechazado'),
];

module.exports = { inscribir, listarVoluntarios, actualizarEstado };
