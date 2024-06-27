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
        const contraseñaRegex = /^(?=.*[A-Z])(?=.*\W).{10,}$/;

        if (!contraseñaRegex.test(contraseña)) {
            return res.status(400).send('La contraseña debe tener al menos una letra mayúscula, un símbolo y un mínimo de 10 caracteres.');
        }
        else if (contraseña !== confirmarContraseña) {
            return res.status(400).send('Las contraseñas no coinciden');
        }

        const result = await pool.query(
            'INSERT INTO Usuarios (Correo, Contraseña, Nombre, Apellido, tipo_usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
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
            'SELECT * FROM Usuarios WHERE Correo = $1 AND Contraseña = $2',
            [correo, contraseña]
        );

        if (result.rows.length > 0) {
            res.redirect('/sedes.html');
        } else {
            res.status(400).send('Correo o contraseña incorrectos');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.registroAuto = async (req, res) => {
    const { patente, tipoVehiculo, color, modelo, tamano } = req.body;

    // Convertir el valor del tipo recibido del HTML a TipoVehiculo

    // Imprimir los valores recibidos para depuración
    console.log('patente:', patente);
    console.log('TipoVehiculo:', tipoVehiculo);
    console.log('color:', color);
    console.log('modelo:', modelo);
    console.log('tamaño:', tamano);

    // Validaciones básicas
    if (!patente || !tipoVehiculo || !color || !modelo || !tamano) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Guardar la información del automóvil en la base de datos
        const result = await pool.query(
            'INSERT INTO vehiculos (Patente, TipoVehiculo, Color, Modelo, Tamano) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [patente, tipoVehiculo, color, modelo, tamano]
        );

        const autoRegistrado = result.rows[0];

        res.status(201).json({
            mensaje: 'Automóvil registrado exitosamente',
            auto: autoRegistrado
        });
    } catch (error) {
        console.error('Error al registrar el automóvil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Administración
exports.admin = async (req, res) => {
    try {
        // Se obtienen datos de base de datos 
        const { rows: datos_sedes } = await pool.query(
            'SELECT id_sede, nombre_sede FROM sedes ORDER BY id_sede'
        );

        const { rows: datos_edificios } = await pool.query(
            'SELECT id_edificio, nombre_edificio, id_sede AS id_sede_edificio FROM edificios ORDER BY id_edificio'
        );

        const { rows: datos_estacionamietos } = await pool.query(
            'SELECT id_espacio, id_edificio AS id_edificio_estacionamiento FROM espacio_estacionamiento ORDER BY id_espacio'
        );

        // Se envían datos a página
        res.json({
            datos_sedes,
            datos_edificios,
            datos_estacionamietos
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminUpdateSede = async (req, res) => {
    const { updateField, newData, securityToken, updateSede } = req.body; 

    console.log('updateField:', updateField); 
    console.log('newData:', newData);
    console.log('securityToken:', securityToken);
    console.log('updateSede:', updateSede);

    try {
        if (updateField == 'dato1') {
        const result = await pool.query(
            'UPDATE sedes SET nombre_sede=$1 WHERE id_sede= $2',
            [newData, updateSede]
        );
        ;}

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminUpdateSede');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminUpdateEdificio = async (req, res) => {
    const { updateField, newData, securityToken, updateEdificio } = req.body; 

    console.log('updateField:', updateField); 
    console.log('newData:', newData);
    console.log('securityToken:', securityToken);
    console.log('updateEdificio:', updateEdificio);

    try {
        if (updateField == 'dato1') {
        const result = await pool.query(
            'UPDATE edificios SET nombre_edificio=$1 WHERE id_edificio= $2',
            [newData, updateEdificio]
        );
        ;}

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminUpdateEdificio');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminUpdateEstacionamiento = async (req, res) => {
    const { updateField, newData, securityToken, updateEstacionamiento } = req.body; 

    console.log('updateField:', updateField); 
    console.log('newData:', newData);
    console.log('securityToken:', securityToken);
    console.log('updateEstacionamiento:', updateEstacionamiento);

    try {
        if (updateField == 'dato1') {
        const result = await pool.query(
            'UPDATE espacio_estacionamiento SET tamaño_estacionamiento=$1 WHERE id_espacio= $2',
            [newData, updateEstacionamiento]
        );
        ;}
        if (updateField == 'dato2') {
        const result = await pool.query(
            'UPDATE espacio_estacionamiento SET tipo_vehiculo=$1 WHERE id_espacio= $2',
            [newData, updateEstacionamiento]
        );
        ;}

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminUpdateEstacionamiento');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminCreateSede = async (req, res) => {
    const { newData, securityToken } = req.body; 

    console.log('newData:', newData);
    console.log('securityToken:', securityToken);

    try {
        const result = await pool.query(
            'INSERT INTO sedes (nombre_sede) VALUES ($1);',
            [newData]
        );

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminCreateSede');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminCreateEdificio = async (req, res) => {
    const { updateSede, newData, securityToken } = req.body; 

    console.log('newData:', newData);
    console.log('securityToken:', securityToken);
    console.log('updateSede:', updateSede);

    try {
        const result = await pool.query(
            'INSERT INTO edificios (nombre_edificio, id_sede, cantidad_est) VALUES ($1, $2, $3);',
            [newData, updateSede, 0]
        );

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminCreateEdificios');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminCreateEstacionamiento = async (req, res) => {
    const { updateEdificio, newData, securityToken } = req.body; 

    console.log('newData:', newData);
    console.log('securityToken:', securityToken);
    console.log('updateEdificio:', updateEdificio);

    try {
        const result = await pool.query(
            'INSERT INTO espacio_estacionamiento (tamaño_estacionamiento, id_edificio, estado, tipo_vehiculo) VALUES ($1, $2, $3, $4);',
            [newData, updateEdificio, 'Disponible', 'Automóvil']
        );

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminCreateEstacionamientos');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminDeleteSede = async (req, res) => { 
    const { updateSede, securityToken } = req.body; 

    console.log('updateSede:', updateSede);
    console.log('securityToken:', securityToken);

    try {
        // Borra espacios de estacionamiento de sede en cuestión en reservas
        const result1 = await pool.query(
            'DELETE FROM reservas WHERE id_espacio IN (SELECT esp_est.id_espacio FROM sedes, edificios, espacio_estacionamiento AS esp_est WHERE sedes.id_sede=$1 AND esp_est.id_edificio=edificios.id_edificio AND edificios.id_sede=sedes.id_sede);',
            [updateSede]
        );

        // Borra espacios de estacionamiento de sede en cuestión
        const result2 = await pool.query(
            'DELETE FROM espacio_estacionamiento WHERE id_espacio IN (SELECT esp_est.id_espacio FROM sedes, edificios, espacio_estacionamiento AS esp_est WHERE sedes.id_sede=$1 AND esp_est.id_edificio=edificios.id_edificio AND edificios.id_sede=sedes.id_sede);',
            [updateSede]
        );

        // Borra edificios de sede en cuestión en guardias
        const result3 = await pool.query(
            'DELETE FROM guardias WHERE id_edificio IN (SELECT edificios.id_edificio FROM sedes, edificios WHERE sedes.id_sede=$1 AND edificios.id_sede=sedes.id_sede);',
            [updateSede]
        );

        // Borra edificios de sede en cuestión
        const result4 = await pool.query(
            'DELETE FROM edificios WHERE id_edificio IN (SELECT edificios.id_edificio FROM sedes, edificios WHERE sedes.id_sede=$1 AND edificios.id_sede=sedes.id_sede);',
            [updateSede]
        );

        // Borra sede en cuestión
        const result5 = await pool.query(
            'DELETE FROM sedes WHERE id_sede=$1;',
            [updateSede]
        );

        //res.send('Datos recibidos y procesados con éxito'); 
        console.log('En adminDeleteSede');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminDeleteEdificio = async (req, res) => { 
    const { updateEdificio, securityToken } = req.body; 

    console.log('updateEdificio:', updateEdificio);
    console.log('securityToken:', securityToken);

    try {
        // Borra espacios de estacionamiento de edificio en cuestión en reservas
        const result1 = await pool.query(
            'DELETE FROM reservas WHERE id_espacio IN (SELECT esp_est.id_espacio FROM edificios, espacio_estacionamiento AS esp_est WHERE edificios.id_edificio=$1 AND esp_est.id_edificio=edificios.id_edificio);',
            [updateEdificio]
        );

        // Borra espacios de estacionamiento de edificio en cuestión
        const result2 = await pool.query(
            'DELETE FROM espacio_estacionamiento WHERE id_espacio IN (SELECT esp_est.id_espacio FROM edificios, espacio_estacionamiento AS esp_est WHERE edificios.id_edificio=$1 AND esp_est.id_edificio=edificios.id_edificio);',
            [updateEdificio]
        );

        // Borra edificio en cuestión en guardias
        const result3 = await pool.query(
            'DELETE FROM guardias WHERE id_edificio IN (SELECT edificios.id_edificio FROM edificios WHERE edificios.id_edificio=$1);',
            [updateEdificio]
        );

        // Borra edificio en cuestión
        const result4 = await pool.query(
            'DELETE FROM edificios WHERE id_edificio=$1;',
            [updateEdificio]
        );

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminDeleteEdificio');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};

exports.adminDeleteEstacionamiento = async (req, res) => { 
    const { updateEstacionamiento, securityToken } = req.body; 

    console.log('updateEstacionamiento:', updateEstacionamiento);
    console.log('securityToken:', securityToken);

    try {
        // Borra espacio de estacionamiento en cuestión en reservas
        const result1 = await pool.query(
            'DELETE FROM reservas WHERE id_espacio=$1;',
            [updateEstacionamiento]
        );

        // Borra espacio de estacionamiento en cuestión
        const result2 = await pool.query(
            'DELETE FROM espacio_estacionamiento WHERE id_espacio=$1;',
            [updateEstacionamiento]
        );

        //res.send('Datos recibidos y procesados con éxito');
        console.log('En adminDeleteEstacionamiento');
        res.redirect('/admin1.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error procesando los datos');
    }
};
