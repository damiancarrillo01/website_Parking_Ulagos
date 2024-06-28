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
router.post('/reservaEliminar',userController.eliminarReserva);
router.post('/reservaActualizar',userController.actualizarReserva);

//GET
router.get('/vehiculos',userController.vehiculos);
router.get('/selectReserva',userController.selectReserva)
module.exports = router;