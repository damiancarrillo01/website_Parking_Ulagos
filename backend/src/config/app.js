const express = require('express');
const app = express();
const path = require('path');
const userRoutes = require('../routes/user.routes');

// Middleware para manejar datos JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../../frontend')));

// Rutas para los archivos HTML
app.get('/iniciosesion.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/iniciosesion.html'));
});

app.get('/registro.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/registro.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/inicio.html'));
});

// Montar rutas de usuarios
app.use('/usuarios', userRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
    res.status(404).send('Ruta no encontrada');
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal');
});

module.exports = app;
