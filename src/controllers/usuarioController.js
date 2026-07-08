const usuarioService = require('../services/usuario.service');

// GET /api/usuarios
async function listarUsuarios(req, res, next) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

// POST /api/usuarios
async function crearUsuario(req, res, next) {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/usuarios/:id
async function actualizarUsuario(req, res, next) {
  try {
    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
};
