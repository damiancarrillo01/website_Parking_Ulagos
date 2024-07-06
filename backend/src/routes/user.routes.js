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
router.post('/reporteGuardia',userController.reporteGuardia);
router.post('/reservaGuardia',userController.reservaGuardia);
router.post('/eliminarReservaGuardia',userController.eliminarReservaGuardia);
router.post('/selectReservas',userController.selectReservas);
router.post('/selectReportes',userController.selectReportes);

//GET
router.get('/vehiculos',userController.vehiculos);
router.get('/selectReserva',userController.selectReserva);
router.get('/selectGuardia',userController.selectGuardia);
router.get('/selectEstacionamientoEstado',userController.selectEstacionamientoEstado);
router.get('/reporteGuardiaSelect',userController.reporteGuardiaSelect);

//admin
router.get('/admin', userController.admin);
router.post('/adminUpdateSede', userController.adminUpdateSede);
router.post('/adminUpdateEdificio', userController.adminUpdateEdificio);
router.post('/adminUpdateEstacionamiento', userController.adminUpdateEstacionamiento);
router.post('/adminCreateSede', userController.adminCreateSede);
router.post('/adminCreateEdificio', userController.adminCreateEdificio);
router.post('/adminCreateEstacionamiento', userController.adminCreateEstacionamiento);
router.post('/adminDeleteSede', userController.adminDeleteSede);
router.post('/adminDeleteEdificio', userController.adminDeleteEdificio);
router.post('/adminDeleteEstacionamiento', userController.adminDeleteEstacionamiento);

module.exports = router;