// TODO: Implementar por el compañero
// Dependencias necesarias:
//   - bcrypt para comparar contraseñas
//   - jsonwebtoken para firmar tokens
//   - AppDataSource.getRepository('Usuario') desde ../config/configDb.mjs

const { AppDataSource } = require('../config/configDb.mjs');

const usuarioRepo = () => AppDataSource.getRepository('Usuario');

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, usuario: object}>}
 */
async function login(email, password) {
  // 1. Buscar usuario por email con usuarioRepo().findOne({ where: { email } })
  // 2. Si no existe → throw new Error('Credenciales inválidas')
  // 3. Verificar password con bcrypt.compare(password, usuario.passwordHash)
  // 4. Si no coincide → throw new Error('Credenciales inválidas')
  // 5. Si usuario.activo === false → throw new Error('Usuario inactivo')
  // 6. Firmar token: jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
  // 7. Retornar { token, usuario: { id, nombre, email, rol } }
  throw new Error('auth.service.login no implementado');
}

/**
 * @param {number} id
 * @returns {Promise<object>}
 */
async function obtenerPerfil(id) {
  // 1. Buscar usuario por id con usuarioRepo().findOne({ where: { id } })
  // 2. Si no existe → throw new Error('Usuario no encontrado')
  // 3. Retornar { id, nombre, email, rol, activo, creadoEn }
  throw new Error('auth.service.obtenerPerfil no implementado');
}

module.exports = {
  login,
  obtenerPerfil,
};
