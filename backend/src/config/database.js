const { Pool } = require("pg");


// Configura el pool de conexiones usando la URL de la base de datos desde las variables de entorno

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false, // Esta opción es para desarrollo. En producción, usa certificados adecuados.
    }
  });

/*
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "5473",
  port: 5432,
});
*/
pool.connect((err, client, done) => {
  if (err) throw err;
  client.query("SET timezone = 'America/Santiago'", (err) => {
    done();
    if (err) {
      console.error("Error setting timezone", err.stack);
    } else {
      console.log("Timezone set to America/Santiago");
    }
  });
});
const connect = async () => {
  try {
    const client = await pool.connect();
    console.log("Base de datos conectada");
    client.release();
  } catch (err) {
    console.error("Error conectando a la base de datos", err.stack);
    throw err;
  }
};

// Exporta el pool para usarlo en otras partes de tu aplicación
module.exports = {
  connect,
  pool,
};

console.log("database.js ejecutado");
