const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/configDb.mjs');

const usuarioRepo = () => AppDataSource.getRepository('Usuario');

function crearToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const usuario = await usuarioRepo().findOne({ where: { email: email.toLowerCase().trim() } });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta al administrador.' });
    }

    const token = crearToken(usuario);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/registro
// Público. Siempre crea la cuenta con rol "visitante".
// Los demás roles solo los puede crear un admin (ver usuarioController.js).
async function registro(req, res, next) {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const existente = await usuarioRepo().findOne({ where: { email: emailNormalizado } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta registrada con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await usuarioRepo().save({
      nombre,
      email: emailNormalizado,
      passwordHash,
      rol: 'visitante',
    });

    const token = crearToken(usuario);

    res.status(201).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/perfil
async function perfil(req, res, next) {
  try {
    const usuario = req.usuario; // ya lo cargó el middleware verificarToken
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, registro, perfil };
