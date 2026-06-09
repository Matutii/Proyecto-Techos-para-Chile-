const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/configDb.mjs');

const usuarioRepo = () => AppDataSource.getRepository('Usuario');
// Autentica un usuario y retorna token JWT + datos del usuario.
/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, usuario: object}>}
 */
async function login(email, password) {
  if (!email || !password) {
    throw Object.assign(new Error('Email y contraseña son requeridos'), { status: 400 });
  }

  const usuario = await usuarioRepo().findOne({ where: { email } });

  // Mismo mensaje para email inexistente o contraseña incorrecta por seguridad
  if (!usuario) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });
  }

  if (!usuario.activo) {
    throw Object.assign(new Error('Usuario inactivo'), { status: 403 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no configurado en el entorno');
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );

  return {
    token,
    usuario: {
      id:       usuario.id,
      nombre:   usuario.nombre,
      email:    usuario.email,
      rol:      usuario.rol,
      permisos: resolverPermisos(usuario.rol),
    },
  };
}
// Retorna el perfil del usuario autenticado
/**
 * @param {number} id
 * @returns {Promise<object>}
 */
async function obtenerPerfil(id) {
  const usuario = await usuarioRepo().findOne({ where: { id: Number(id) } });

  if (!usuario) {
    throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
  }

  return {
    id:        usuario.id,
    nombre:    usuario.nombre,
    email:     usuario.email,
    rol:       usuario.rol,
    activo:    usuario.activo,
    creadoEn:  usuario.creadoEn,
    permisos:  resolverPermisos(usuario.rol),
  };
}
// Devuelve los permisos según el rol del usuario
/**
 * @param {'admin'|'colaborador'|'coordinador_logistica'} rol
 * @returns {object}
 */
function resolverPermisos(rol) {
  const permisos = {
    admin: {
      verDashboard:       true,
      editarProyectos:    true,
      editarStock:        true,
      editarVoluntarios:  true,
      editarDonaciones:   true,
      administrarUsuarios:true,
    },
    coordinador_logistica: {
      verDashboard:       true,
      editarProyectos:    false,
      editarStock:        true,
      editarVoluntarios:  false,
      editarDonaciones:   true,
      administrarUsuarios:false,
    },
    colaborador: {
      verDashboard:       false,
      editarProyectos:    false,
      editarStock:        false,
      editarVoluntarios:  false,
      editarDonaciones:   false,
      administrarUsuarios:false,
    },
  };

  return permisos[rol] ?? permisos['colaborador'];
}

module.exports = { login, obtenerPerfil };