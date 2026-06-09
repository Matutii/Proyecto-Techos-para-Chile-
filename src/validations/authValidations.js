const {body}= require('express-validator');
const login= [
    body('email').isEmail().withMessage('Debe ser un email valido').normalizeEmail(),
    body('password').isLength({min:6}).withMessage('La contraseña debe tener al menos 6 caracteres'),
];
module.exports={login};