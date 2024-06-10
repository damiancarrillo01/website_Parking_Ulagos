var express = require('express');
const { Client } = require('pg');
var app = express();

app.get("/",function(req,res){
    es.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});
app.listen(3000)

const  client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '5473',
    port: 5432,
});

client.connect()
    .then(() => console.log('Conexión exitosa a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos', err));

    client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname='public'")
    .then(result => {
        console.log("Tablas en la base de datos:");
        result.rows.forEach(row => {
            console.log(row.tablename);
        });
    })
    .catch(err => console.error('Error al obtener la lista de tablas', err));
