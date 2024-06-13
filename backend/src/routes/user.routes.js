//user.routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');


router.post('/registro', userController.registroUsuario);
router.post('/iniciosesion', userController.inicioSesionUsuario);


module.exports = router;