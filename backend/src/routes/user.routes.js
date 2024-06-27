//user.routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');

//POST
router.post('/registro', userController.registroUsuario);
router.post('/iniciosesion', userController.inicioSesionUsuario);
router.post('/sedes',userController.sedes);
router.post('/principal', userController.registroAuto);
router.post('/reserva',userController.reserva);

//GET
router.get('/vehiculos',userController.vehiculos)
module.exports = router;