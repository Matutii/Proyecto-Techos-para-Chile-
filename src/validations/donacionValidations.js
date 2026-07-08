// Reglas de validación para el registro y gestión de donaciones
const { body, query, param } = require('express-validator');

const crearDonacion = [
  body('donanteNombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre del donante debe tener entre 3 y 150 caracteres'),

  body('donanteEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),

  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 1000 }).withMessage('El monto mínimo es de $1.000 CLP'),

  body('metodoPago')
    .optional()
    .isIn(['transferencia', 'tarjeta', 'efectivo'])
    .withMessage('Método de pago inválido. Use: transferencia, tarjeta o efectivo'),
];

const listarDonaciones = [
  query('estado')
    .optional()
    .isIn(['pendiente', 'confirmada', 'rechazada'])
    .withMessage('Estado inválido. Use: pendiente, confirmada o rechazada'),

  query('metodoPago')
    .optional()
    .isIn(['transferencia', 'tarjeta', 'efectivo'])
    .withMessage('Método de pago inválido'),
];

const actualizarEstado = [
  param('id').isInt({ min: 1 }),
  body('estado')
    .isIn(['pendiente', 'confirmada', 'rechazada'])
    .withMessage('Estado inválido. Use: pendiente, confirmada o rechazada'),
];

module.exports = { crearDonacion, listarDonaciones, actualizarEstado };