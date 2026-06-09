function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso restringido a administradores' });
  }
  next();
}

function soloAccesoBodega(req, res, next) {
  if (!['admin', 'coordinador_logistica'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso restringido a bodega' });
  }
  next();
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso restringido a roles: ${roles.join(', ')}` });
    }
    next();
  };
}

module.exports = { soloAdmin, soloAccesoBodega, requiereRol };
