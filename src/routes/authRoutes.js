const express = require('express');
const router = express.Router();
const {validationResult}= require('express-validator');
const verificarToken= require('../middlewares/verificarToken');
const ctrl= require('../controllers/authController');
const v = require('../validations/authValidations');
//middleware va a reutilizar para hacer un reporte de errores de validacion
const check = (req, res, next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
};
//pots /api/auth/login
//Publico: no requiere token, mostrara {token, usuario{id, nombre, email, rol, permisos}}
router.post('/login', v.login, check, ctrl.login);
//get /api/auth/perfil
//Privado: requiere token, mostrara {id, nombre, email, rol, permisos}
router.get('/perfil', verificarToken, ctrl.perfil);
module.exports= router;