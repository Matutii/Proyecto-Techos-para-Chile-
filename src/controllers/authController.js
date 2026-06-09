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
// GET /api/auth/perfil - Retorna perfil del usuario autenticado
async function perfil(req, res, next){
    try{
        const usuario= await authService.obtenerPerfil(req.usuario.id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
}
module.exports = {login, perfil};
