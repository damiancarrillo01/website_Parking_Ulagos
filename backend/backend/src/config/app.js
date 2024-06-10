// app.js
const express = require('express');
const app = express();
const userRoutes = require('./routes/user.routes');

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Usar las rutas de usuario
app.use('/api', userRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ message: 'Recurso no encontrado' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});