// src/controllers/user.controllers.js
const { pool } = require('../config/database');

exports.registroUsuario = async (req, res) => {
    const { nombre, apellido, correo, contraseña, confirmarContraseña } = req.body;
    let tipoUsuario;

    console.log('Nombre:', nombre);
    console.log('Apellido:', apellido);
    console.log('Correo:', correo);
    console.log('Contraseña:', contraseña);
    console.log('Confirmar Contraseña:', confirmarContraseña);

    if (correo.endsWith('@alumnos.ulagos.cl')) {
        tipoUsuario = 'Estudiante';
    } else if (correo.endsWith('@ulagos.cl')) {
        tipoUsuario = 'Docente';
    } else {
        return res.status(400).send('El correo electrónico debe ser de la Universidad de Los Lagos');
    }

    console.log('TipoUsuario:', tipoUsuario);

    try {
        if (contraseña !== confirmarContraseña) {
            return res.status(400).send('Las contraseñas no coinciden');
        }

        const result = await pool.query(
            'INSERT INTO Usuarios (Correo, Contrasena, Nombre, Apellido, TipoUsuario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [correo, contraseña, nombre, apellido, tipoUsuario]
        );

        //res.send('Datos recibidos y procesados con éxito');
        res.redirect('/')
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.inicioSesionUsuario = async (req, res) => {
    const { correo, contraseña } = req.body;

    console.log('Correo:', correo);
    console.log('Contraseña:', contraseña);

    try {
        const result = await pool.query(
            'SELECT * FROM Usuarios WHERE Correo = $1 AND Contrasena = $2',
            [correo, contraseña]
        );

        if (result.rows.length > 0) {
            res.redirect('/sedes.html');
            //res.send('Inicio de sesión exitoso');
        } else {
            res.status(400).send('Correo o contraseña incorrectos');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};