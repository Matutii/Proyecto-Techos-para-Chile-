const authService = require('../services/auth.service');

// POST /api/auth/login - Inicia sesión y devuelve token
async function login(req, res, next) {
    try {
        const {email, password} = req.body;
        const resultado= await authService.login(email, password);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}
// POST /api/auth/registro - Crea una cuenta pública con rol visitante y devuelve token
async function registro(req, res, next) {
    try {
        const {nombre, email, password} = req.body;
        const resultado = await authService.registro(nombre, email, password);
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
}
// GET /api/auth/perfil - Retorna perfil del usuario autenticado
async function perfil(req, res, next){
    try{
        const usuario= await authService.obtenerPerfil(req.usuario.id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
}
module.exports = {login, registro, perfil};
