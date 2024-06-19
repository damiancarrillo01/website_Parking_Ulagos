const app = require('./app'); // Requerir app.js
const database = require('./database');

const main = async () => {
    try {
        await database.connect();
        app.listen(4000, () => {
            console.log('Servidor escuchando en el puerto 3000');
        });
    } catch (err) {
        console.error('Error inicializando la aplicación', err);
        process.exit(1); // Salir del proceso con un código de error
    }
};

main();








