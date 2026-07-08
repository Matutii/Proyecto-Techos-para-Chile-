const { body, param } = require('express-validator');
const { ROLES_VALIDOS } = require('../services/usuario.service');

const crearUsuario = [
  body('nombre').isString().trim().isLength({ min: 3, max: 100 }),
  body('email').isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').isIn(ROLES_VALIDOS).withMessage(`Rol inválido. Roles válidos: ${ROLES_VALIDOS.join(', ')}`),
];

const actualizarUsuario = [
  param('id').isInt({ min: 1 }),
  body('rol').optional().isIn(ROLES_VALIDOS).withMessage(`Rol inválido. Roles válidos: ${ROLES_VALIDOS.join(', ')}`),
  body('activo').optional().isBoolean(),
];

module.exports = {
  crearUsuario,
  actualizarUsuario,
};
