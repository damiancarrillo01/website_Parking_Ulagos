// main.js
const app = require('./app');
const database = require('./database');

const main = async () => {
    try {
        // Conectar a la base de datos
        await database.connect();
        console.log('Conexión a la base de datos exitosa');

        // Iniciar el servidor
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (err) {
        console.error('Error inicializando la aplicación:', err);
        process.exit(1); // Salir del proceso con un código de error
    }
};

// Llamar a la función principal
main();