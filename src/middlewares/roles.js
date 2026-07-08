// Middlewares de autorización por rol. Todos asumen que verificarToken
// ya corrió antes y dejó el usuario autenticado en req.usuario.

// Permite continuar solo al rol admin
function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

// Permite continuar a los roles que administran bodega (admin y coordinador_logistica)
function soloAccesoBodega(req, res, next) {
  if (!['admin', 'coordinador_logistica'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso restringido a bodega' });
  }
  next();
}

// Genera un middleware que acepta cualquier combinación de roles, ej: requiereRol('admin', 'colaborador')
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso restringido a roles: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { soloAdmin, soloAccesoBodega, requiereRol };
