const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Parking_ulagos',
    password: '12345',
    port: 5433,
});

const connect = async () => {
    try {
        const client = await pool.connect();
        console.log('Base de datos conectada');
        client.release(); // Liberar el cliente de vuelta al pool
    } catch (err) {
        console.error('Error conectando a la base de datos', err.stack);
        throw err; // Lanzamos el error para que se pueda manejar adecuadamente en main
    }
};

module.exports = {
    connect,
    pool,
};

console.log('database.js ejecutado');