const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/configDb.mjs');

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

module.exports = verificarToken;
