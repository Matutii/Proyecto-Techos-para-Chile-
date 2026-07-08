const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/configDb.mjs');

// Exige un token JWT válido (header "Authorization: Bearer <token>").
// Si es válido y el usuario sigue activo, deja el usuario completo en req.usuario;
// si no, corta la request con 401.
async function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await AppDataSource.getRepository('Usuario').findOne({
      where: { id: decoded.id },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ error: 'Token inválido o usuario inactivo' });
    }

    req.usuario = usuario;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next(err);
  }
}

/**
 * Igual que verificarToken, pero no rechaza si no hay token.
 * Útil en rutas públicas (como donar) donde un usuario logueado opcionalmente
 * puede quedar vinculado, sin exigir que inicie sesión.
 */
async function verificarTokenOpcional(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await AppDataSource.getRepository('Usuario').findOne({
      where: { id: decoded.id },
    });

    if (usuario && usuario.activo) {
      req.usuario = usuario;
    }
  } catch (err) {
    // Token inválido/expirado: se ignora y la request sigue como anónima
  }

  next();
}

module.exports = verificarToken;
module.exports.verificarTokenOpcional = verificarTokenOpcional;
