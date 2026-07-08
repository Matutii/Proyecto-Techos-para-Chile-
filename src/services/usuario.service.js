const bcrypt = require('bcrypt');
const { AppDataSource } = require('../config/configDb.mjs');

const usuarioRepo = () => AppDataSource.getRepository('Usuario');

const ROLES_VALIDOS = ['admin', 'coordinador_logistica', 'colaborador', 'encargado_cuadrillas', 'visitante'];

// Helper para lanzar errores con el status HTTP que espera el manejador central
function errorNoEncontrado(mensaje) {
  const err = new Error(mensaje);
  err.status = 404;
  return err;
}

function errorConflicto(mensaje) {
  const err = new Error(mensaje);
  err.status = 409;
  return err;
}

// Saca el passwordHash antes de devolver el usuario
function sinPassword(usuario) {
  const { passwordHash, ...resto } = usuario;
  return resto;
}

// Lista todos los usuarios ordenados por id
async function listarUsuarios() {
  const usuarios = await usuarioRepo().find({ order: { id: 'ASC' } });
  return usuarios.map(sinPassword);
}

// Crea una cuenta con el rol indicado (uso exclusivo de admin)
async function crearUsuario(datos) {
  const emailNormalizado = datos.email.toLowerCase().trim();

  const existente = await usuarioRepo().findOne({ where: { email: emailNormalizado } });
  if (existente) {
    throw errorConflicto('Ya existe un usuario con ese email');
  }

  const passwordHash = await bcrypt.hash(datos.password, 10);

  const usuario = await usuarioRepo().save({
    nombre: datos.nombre,
    email: emailNormalizado,
    passwordHash,
    rol: datos.rol,
  });

  return sinPassword(usuario);
}

// Cambia el rol y/o activa/desactiva una cuenta existente
async function actualizarUsuario(id, datos) {
  const usuario = await usuarioRepo().findOne({ where: { id: Number(id) } });
  if (!usuario) {
    throw errorNoEncontrado('Usuario no encontrado');
  }

  if (datos.rol !== undefined) {
    usuario.rol = datos.rol;
  }

  if (datos.activo !== undefined) {
    usuario.activo = Boolean(datos.activo);
  }

  await usuarioRepo().save(usuario);
  return sinPassword(usuario);
}

module.exports = {
  ROLES_VALIDOS,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
};
