//user.routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');


router.post('/registro', userController.registroUsuario);
router.post('/iniciosesion', userController.inicioSesionUsuario);
router.post('/principal', userController.registroAuto);

router.get('/admin', userController.admin);
router.post('/adminUpdateSede', userController.adminUpdateSede);
router.post('/adminUpdateEdificio', userController.adminUpdateEdificio);
router.post('/adminUpdateEstacionamiento', userController.adminUpdateEstacionamiento);

module.exports = router;