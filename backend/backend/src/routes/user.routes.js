// user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('./user.controllers');

// Ruta para obtener todos los usuarios
router.get('/users', userController.getAllUsers);

// Ruta para obtener un usuario por ID
router.get('/users/:id', userController.getUserById);

// Ruta para crear un nuevo usuario
router.post('/users', userController.createUser);

// Ruta para actualizar un usuario existente
router.put('/users/:id', userController.updateUser);

// Ruta para eliminar un usuario
router.delete('/users/:id', userController.deleteUser);

module.exports = router;