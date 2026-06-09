const authService = require('../services/auth.service');//post /api/auth/login
//body: {email, password}
async function login(req, res, next) {
    try {
        const {email, password} = req.body;
        const resultado= await auth.service.login(email, password);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}
//get /api/auth/perfil, va a necesitar un token valido
async function perfil(req, res, next){
    try{
        const usuario= await auth.service.obtenerPerfil(req.usuario.id);
        res.json(usuario);
    } catch (error) {
        next(error);
    }
}
module.exports = {login, perfil};
