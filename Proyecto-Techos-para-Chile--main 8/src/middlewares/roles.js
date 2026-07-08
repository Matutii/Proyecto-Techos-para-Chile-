// Middleware para restringir una ruta a ciertos roles.
// Se usa así: permitirRoles('admin', 'coordinador_logistica')
//
// Roles que existen en el sistema:
//   admin                 -> puede hacer todo
//   coordinador_logistica -> maneja la bodega (stock)
//   colaborador           -> puede retirar materiales y registrar horas
//   encargado_cuadrillas  -> maneja cuadrillas, voluntarios y horas
//   visitante             -> solo puede donar

function permitirRoles(...rolesPermitidos) {
  return function (req, res, next) {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para hacer esto' });
    }
    next();
  };
}

module.exports = permitirRoles;
