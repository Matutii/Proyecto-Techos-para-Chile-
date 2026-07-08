const bcrypt = require('bcrypt');
const { AppDataSource } = require('../config/configDb.mjs');

const usuarioRepo = () => AppDataSource.getRepository('Usuario');

const ROLES_VALIDOS = [
  'admin',
  'coordinador_logistica',
  'colaborador',
  'encargado_cuadrillas',
  'visitante',
];

// Saca el passwordHash antes de mandar el usuario al frontend
function sinPassword(usuario) {
  const { passwordHash, ...resto } = usuario;
  return resto;
}

// GET /api/usuarios (solo admin)
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await usuarioRepo().find({ order: { id: 'ASC' } });
    res.json(usuarios.map(sinPassword));
  } catch (err) {
    next(err);
  }
}

// POST /api/usuarios (solo admin)
// Así se crean las cuentas de bodega, colaborador, encargado de cuadrillas, etc.
async function crearUsuario(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ error: 'Nombre, email, password y rol son requeridos' });
    }

    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `Rol inválido. Roles válidos: ${ROLES_VALIDOS.join(', ')}` });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const existente = await usuarioRepo().findOne({ where: { email: emailNormalizado } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await usuarioRepo().save({
      nombre,
      email: emailNormalizado,
      passwordHash,
      rol,
    });

    res.status(201).json(sinPassword(usuario));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/usuarios/:id (solo admin)
// Cambia el rol y/o activa/desactiva una cuenta.
async function actualizarUsuario(req, res, next) {
  try {
    const { rol, activo } = req.body;

    const usuario = await usuarioRepo().findOne({ where: { id: Number(req.params.id) } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (rol !== undefined) {
      if (!ROLES_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: `Rol inválido. Roles válidos: ${ROLES_VALIDOS.join(', ')}` });
      }
      usuario.rol = rol;
    }

    if (activo !== undefined) {
      usuario.activo = Boolean(activo);
    }

    await usuarioRepo().save(usuario);
    res.json(sinPassword(usuario));
  } catch (err) {
    next(err);
  }
}

module.exports = { listarUsuarios, crearUsuario, actualizarUsuario };
