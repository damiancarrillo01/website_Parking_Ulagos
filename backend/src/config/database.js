const express = require('express');
const { Pool } = require('pg');
const { config } = require('dotenv');

// Carga las variables de entorno desde el archivo .env
config();

// Configura el pool de conexiones usando la URL de la base de datos desde las variables de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Esta opción es para desarrollo. En producción, usa certificados adecuados.
  }
});

const connect = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('Base de datos conectada');
  } catch (err) {
    console.error('Error conectando a la base de datos', err.stack);
    if (client) {
      client.release();
    }
    throw err; // Lanzamos el error para que se pueda manejar adecuadamente en main
  } finally {
    if (client) {
      client.release(); // Liberar el cliente de vuelta al pool en caso de éxito o fallo
    }
  }
};

// Exporta el pool para usarlo en otras partes de tu aplicación
module.exports = {
  connect,
  pool,
};