// src/controllers/user.controllers.js
const { pool } = require("../config/database");

exports.registroUsuario = async (req, res) => {
  const { nombre, apellido, correo, contraseña, confirmarContraseña } =
    req.body;
  let tipoUsuario;

  if (correo.endsWith("@alumnos.ulagos.cl")) {
    tipoUsuario = "Estudiante";
  } else if (correo.endsWith("@ulagos.cl")) {
    tipoUsuario = "Docente";
  } else if (correo.endsWith("@guardias.ulagos.cl")) {
    tipoUsuario = "Guardia";
  } else if (correo.endsWith("@admin.ulagos.cl")) {
    tipoUsuario = "Admin";
  } else {
    return res
      .status(400)
      .send("El correo electrónico debe ser de la Universidad de Los Lagos");
  }

  console.log("TipoUsuario:", tipoUsuario);

  try {
    const correoExistente = await pool.query(
      "SELECT correo FROM usuarios WHERE correo = $1",
      [correo]
    );

    if (correoExistente.rowCount > 0) {
      return res.status(400).send("correo en uso");
    }

    const contraseñaRegex = /^(?=.*[A-Z])(?=.*\W).{10,}$/;

    if (!contraseñaRegex.test(contraseña)) {
      return res
        .status(400)
        .send(
          "La contraseña debe tener al menos una letra mayúscula, un símbolo y un mínimo de 10 caracteres."
        );
    } else if (contraseña !== confirmarContraseña) {
      return res.status(400).send("Las contraseñas no coinciden");
    }

    const result = await pool.query(
      "INSERT INTO Usuarios (Correo, Contraseña, Nombre, Apellido, Tipo_Usuario) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [correo, contraseña, nombre, apellido, tipoUsuario]
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.inicioSesionUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;

  // Validar que los campos no estén vacíos
  if (!correo || !contraseña) {
    return res.status(400).send("Por favor completa todos los campos.");
  }

  console.log("Correo:", correo);
  console.log("Contraseña:", contraseña);

  try {
    let result;
    let tipoUsuario;
    let usuarioId;

    // Consulta para usuarios normales (alumnos.ulagos.cl, ulagos.cl)
    if (correo.endsWith("@alumnos.ulagos.cl") || correo.endsWith("@ulagos.cl")) {
      result = await pool.query(
        "SELECT id_usuario, correo, contraseña, tipo_usuario FROM Usuarios WHERE correo = $1 AND contraseña = $2",
        [correo, contraseña]
      );
      if (result.rows.length > 0) {
        usuarioId = result.rows[0].id_usuario;
        tipoUsuario = result.rows[0].tipo_usuario;
      }
    } 
    // Consulta para guardias
    else {
      result = await pool.query(
        "SELECT id_guardia, correo, contraseña FROM Guardias WHERE correo = $1 AND contraseña = $2",
        [correo, contraseña]
      );
      if (result.rows.length > 0) {
        usuarioId = result.rows[0].id_guardia;
        tipoUsuario = "guardia";
      }
    }

    if (result.rows.length > 0) {
      console.log("ID de Usuario:", usuarioId);
      console.log("Tipo de Usuario:", tipoUsuario);

      // Redirigir según el tipo de usuario
      res.json({ tipo_usuario: tipoUsuario, usuarioId, redirectUrl: "/sedes.html" });
    } else {
      res.status(400).send("Este usuario no existe");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.sedes = async (req, res) => {
  const { buttonId } = req.body; // Obtener el idboton del cuerpo de la solicitud
  
  console.log("ID de Botón:", buttonId);
  try {
    // Lógica adicional si es necesario
    let redirectUrl = "/principal1damian.html"; // Variable para almacenar el URL de redirección basado en buttonId

    // Responder con un JSON que indique al frontend el buttonId y el redirectUrl
    res.status(200).json({ buttonId, redirectUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};
exports.registroAuto = async (req, res) => {
  const { patente, tipo_vehiculo, color, modelo, tamaño , usuarioId} = req.body;
  console.log("usuarioid", usuarioId);
  console.log("patente:", patente);
  console.log("tipo_vehiculo:", tipo_vehiculo);
  console.log("color:", color);
  console.log("modelo:", modelo);
  console.log("tamaño:", tamaño);

  // Validaciones básicas
  if (!patente || !tipo_vehiculo || !color || !modelo || !tamaño) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Guardar la información del automóvil en la base de datos
    const result = await pool.query(
      "INSERT INTO vehiculo (Patente, Tipo_Vehiculo, Color, Modelo, Tamaño) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [patente, tipo_vehiculo, color, modelo, tamaño]
    );

    const autoRegistrado = result.rows[0];

    const poseer = await pool.query(
      "INSERT INTO poseer_vehiculo (id_usuario,patente) VALUES ($1,$2) RETURNING *",
      [usuarioId, patente]
    );
    res.status(201).json({
      mensaje: "Automóvil registrado exitosamente",
      auto: autoRegistrado,
    });
  } catch (error) {
    console.error("Error al registrar el automóvil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.vehiculos = async (req, res) => {
  const { usuarioId } = req.query;

  console.log(usuarioId);
  // Verifica si el usuario está autenticado
  if (!usuarioId) {
    return res.status(401).send("Usuario no autenticado");
  }

  try {
    // Consulta para obtener los vehículos del usuario
    const result = await pool.query(
      "SELECT p.patente, v.tipo_vehiculo, v.color, v.modelo, v.tamaño FROM Vehiculo v JOIN poseer_vehiculo p ON p.patente = v.patente WHERE p.id_usuario = $1",
      [usuarioId]
    );

    console.log(result.rows); // Muestra los resultados en la consola para depuración
    res.json(result.rows); // Envía los vehículos como respuesta JSON
  } catch (err) {
    console.error("Error al obtener los vehículos:", err);
    res.status(500).send("Error al obtener los vehículos");
  }
};
exports.reserva = async (req, res) => {
  const { edificio, patente, id_espacio, hora_entrada, hora_salida,usuarioId } = req.body;

  console.log("usuarioid : ", usuarioId);
  console.log("Edificio : ", edificio);
  console.log("hora entrada : ", hora_entrada);
  console.log("hora salida : ", hora_salida);
  console.log("Espacio : ", id_espacio);
  console.log("Pantente: ",patente);

  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  // Validaciones básicas
  if (!edificio || !patente || !hora_entrada || !hora_salida) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Select para verificar si ya existe una reserva
    const resultUsu = await pool.query(
      "SELECT id_usuario FROM reservas WHERE id_usuario = $1",
      [usuarioId]
    );

    if (resultUsu.rows.length > 0) {
      return res.status(121).json({ mensaje: "Ya tienes una reserva" });
    } else {
      const id_edificio = await pool.query(
        "SELECT id_edificio FROM edificios WHERE nombre_edificio = $1",
        [edificio]
      ); // Asumiendo que hora_entrada y hora_salida están en formato "HH:mm"
      const hora_entrada_parts = hora_entrada.split(":");
      const hora_salida_parts = hora_salida.split(":");

      // Obtener la fecha actual
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Month is zero-indexed, so add 1
      const day = now.getDate();

      // Construir fechas completas ajustadas a la zona horaria UTC-4
      const hora_entrada_utc = new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          hora_entrada_parts[0],
          hora_entrada_parts[1]
        )
      );
      hora_entrada_utc.setHours(hora_entrada_utc.getHours() - 4);
      const hora_entrada_completa = hora_entrada_utc
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const hora_salida_utc = new Date(
        Date.UTC(
          year,
          month - 1,
          day,
          hora_salida_parts[0],
          hora_salida_parts[1]
        )
      );
      hora_salida_utc.setHours(hora_salida_utc.getHours() - 4);
      const hora_salida_completa = hora_salida_utc
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      console.log('tu horasalida completa es',hora_salida_completa)
      const result = await pool.query(
        "INSERT INTO reservas (id_edificio, id_espacio, id_usuario, patente, hora_entrada_reserva, hora_salida_reserva) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          id_edificio.rows[0].id_edificio,
          id_espacio_int,
          usuarioId,
          patente,
          hora_entrada_completa,
          hora_salida_completa,
        ]
      );

      const updateEstado = await pool.query(
        "UPDATE espacio_estacionamiento SET estado=$1 WHERE id_espacio = $2",
        ["Reservado", id_espacio_int]
      );
      
      const reservaRegistrada = result.rows[0];
      res.status(201).json({
        mensaje: "Reserva registrada exitosamente",
        reserva: reservaRegistrada,
      });
    }
  } catch (error) {
    console.error("Error al registrar la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

let aumentada = 0; // Inicialización fuera del ámbito de la función

exports.actualizarReserva = async (req, res) => {
  const { patente, id_espacio, usuarioId } = req.body;
  console.log(usuarioId);

  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Verificar si existe la reserva y obtener la hora de salida actual
    const resultReserva = await pool.query(
      "SELECT hora_salida_reserva FROM reservas WHERE id_usuario = $1 AND patente = $2 AND id_espacio = $3",
      [usuarioId, patente, id_espacio_int]
    );

    if (resultReserva.rows.length > 0) {
      const { hora_salida_reserva } = resultReserva.rows[0];

      // Verificar si la reserva ya ha sido aumentada
      if (aumentada === 1) {
        return res
          .status(400)
          .json({ error: "La reserva ya ha sido aumentada anteriormente" });
      }

      // Aumentar la hora de salida en una hora
      const horaSalidaActual = new Date(hora_salida_reserva);
      horaSalidaActual.setHours(horaSalidaActual.getHours() + 1); // Aumentar en una hora
      aumentada = 1; // Incrementar aumentada a 1

      // Actualizar la reserva con la nueva hora de salida y marcar como aumentada
      const updateReserva = await pool.query(
        "UPDATE reservas SET hora_salida_reserva = $1 WHERE id_usuario = $2 AND patente = $3 AND id_espacio = $4 RETURNING *",
        [horaSalidaActual, usuarioId, patente, id_espacio_int]
      );

      if (updateReserva.rows.length > 0) {
        const reservaActualizada = updateReserva.rows[0];
        res.status(201).json({
          mensaje: "Reserva aumentada exitosamente",
          nueva_hora_salida:
            reservaActualizada.hora_salida_reserva.toISOString(), // Devuelve la nueva hora de salida en formato ISO8601
        });
      } else {
        res.status(404).json({ error: "No se encontró reserva para este usuario" });
      }
    } else {
      res.status(404).json({ error: "No se encontró reserva para este usuario" });
    }
  } catch (error) {
    console.error("Error al aumentar la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.eliminarReserva = async (req, res) => {
  const { patente, id_espacio,usuarioId } = req.body;
  console.log(usuarioId)
  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Select para verificar si ya existe una reserva
    const resultUsu = await pool.query(
      "SELECT id_usuario FROM reservas WHERE id_usuario = $1",
      [usuarioId]
    );

    if (resultUsu.rows.length > 0) {
      const DeleteReserva = await pool.query(
        "DELETE FROM  reservas WHERE id_usuario = $1 and patente= $2",
        [usuarioId, patente]
      );
      const updateEstado = await pool.query(
        "UPDATE espacio_estacionamiento SET estado=$1 WHERE id_espacio = $2",
        ["Disponible", id_espacio_int]
      );

      const reservaEliminada = DeleteReserva.rows[0];
      aumentada = 0
      return res.status(201).json({
        mensaje: "Reserva Eliminada exitosamente",
        reserva: reservaEliminada,

      });
    } else {
      return res
        .status(404)
        .json({ error: "No se encontró reserva para este usuario" });
    }
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.selectReserva = async (req, res) => {
  const { usuarioId } = req.query;

  console.log(usuarioId);

  if (!usuarioId) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    const resultReserva = await pool.query(
      "SELECT r.id_edificio, r.id_reserva, e.nombre_edificio," +
        " r.id_espacio, r.id_usuario, r.patente, r.hora_entrada_reserva, r.hora_salida_reserva " +
        "FROM reservas r " +
        "JOIN edificios e ON r.id_edificio = e.id_edificio " +
        "WHERE r.id_usuario = $1",
      [usuarioId]
    );

    if (resultReserva.rows.length > 0) {
      const reserva = resultReserva.rows[0];
      res.status(200).json({ reserva });
    } else {
      return res
        .status(404)
        .json({ error: "No se encontró una reserva para este usuario" });
    }
  } catch (error) {
    console.error("Error al seleccion}ar la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



exports.selectGuardia = async (req, res) => {
  const id_usuario = global.usuarioId;

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    const selectGuardia = await pool.query(
      "SELECT g.id_guardia, e.nombre_edificio, s.nombre_sede " +
        "FROM guardias g " +
        "JOIN edificios e ON g.id_edificio = e.id_edificio " +
        "JOIN sedes s ON e.id_sede = s.id_sede " +
        "WHERE g.id_guardia = $1;",
      [id_usuario]
    );

    if (selectGuardia.rows.length > 0) {
      const guardiaReporte = selectGuardia.rows[0];
      res.status(200).json({ guardiaReporte });
    } else {
      return res
        .status(404)
        .json({ error: "No se encontraron datos para este guardiaReporte" });
    }
  } catch (error) {
    console.error("Error al seleccionar al guardiaReporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.reporteGuardia = async (req, res) => {
  const { patente, reporte, id_espacio } = req.body;
  const id_usuario = global.usuarioId;
  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO reportes (id_guardia, id_espacio, patente, reporte)" +
        "VALUES ($1, $2, $3, $4);",
      [id_usuario, id_espacio_int, patente, reporte]
    );

    const reservaRegistrada = result.rows[0];
    res.status(201).json({
      mensaje: "Reporte registrado exitosamente",
      reserva: reservaRegistrada,
    });
  } catch (error) {
    console.error("Error al seleccionar al guardiaReporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
exports.reservaGuardia = async (req, res) => {
  const { patente, id_espacio, hora_salida } = req.body;

  console.log("Patente: ", patente);
  console.log("Id_Espacio: ", id_espacio);
  console.log("Hora Salida: ", hora_salida);

  // Validaciones básicas
  if (!patente || !hora_salida || !id_espacio) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Convertir id_espacio a entero
    const id_espacio_int = parseInt(id_espacio, 10); // Base 10

    // Verificar si ya existe una reserva para esta patente en este espacio
    const reservaExistente = await pool.query(
      "SELECT * FROM reservas WHERE patente = $1",
      [patente]
    );

    // Si hay una reserva existente, devolver un error
    if (reservaExistente.rows.length > 0) {
      return res.status(409).json({
        mensaje: "Ya existe una reserva para esta patente en este espacio",
      });
    }

    const poseerVehiculoResult = await pool.query(
      "SELECT id_usuario FROM poseer_vehiculo WHERE patente = $1",
      [patente]
    );
    const id_usuario = poseerVehiculoResult.rows[0].id_usuario;

    // Verificar si se encontró un id_usuario válido
    if (!id_usuario) {
      return res.status(404).json({
        error: "No se encontró un usuario válido para la patente proporcionada",
      });
    }

    // Obteniendo el id_edificio del espacio de estacionamiento
    const result = await pool.query(
      "SELECT EE.id_edificio " +
        "FROM espacio_estacionamiento EE " +
        "WHERE EE.id_espacio = $1",
      [id_espacio_int]
    );

    const id_edificio = result.rows[0].id_edificio;

    // Obtener la hora actual en formato ISO
    const hora_entrada_completa = new Date().toISOString();

    // Convertir hora_salida a objeto Date en formato "HH:mm"
    const horaSalida = new Date();
    const [horaSalidaEspecifica, minutosSalidaEspecifica] = hora_salida
      .split(":")
      .map(Number);
    horaSalida.setUTCHours(horaSalidaEspecifica, minutosSalidaEspecifica);

    // Convertir a cadena ISO para almacenar en la base de datos
    const hora_salida_completa = horaSalida.toISOString();

    // Insertar la reserva en la base de datos
    const reserva = await pool.query(
      "INSERT INTO reservas (id_edificio, id_espacio, id_usuario, patente, hora_entrada_reserva, hora_salida_reserva) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        id_edificio,
        id_espacio_int,
        id_usuario,
        patente,
        hora_entrada_completa,
        hora_salida_completa,
      ]
    );

    // Actualizar estado del espacio de estacionamiento a "Reservado"
    await pool.query(
      "UPDATE espacio_estacionamiento SET estado = $1 WHERE id_espacio = $2",
      ["Reservado", id_espacio_int]
    );

    // Responder con la reserva registrada
    res.status(201).json({
      mensaje: "Reserva registrada exitosamente",
      reserva: reserva.rows[0],
    });
  } catch (error) {
    console.error("Error al registrar la reserva:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
exports.eliminarReservaGuardia = async (req, res) => {
  const { id_espacio } = req.body;
  console.log("id_espacio recibido:", id_espacio);
  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!id_espacio_int) {
    return res.status(400).json({ error: "id_espacio no válido" });
  }

  try {
    // Select para verificar si ya existe una reserva
    const result = await pool.query(
      "SELECT R.id_usuario, R.patente " +
        "FROM reservas R " +
        "WHERE R.id_espacio = $1",
      [id_espacio_int]
    );
    if (result.rows.length > 0) {
      const id_usuario = result.rows[0].id_usuario;
      const patente = result.rows[0].patente;

      // Eliminar la reserva
      const deleteReserva = await pool.query(
        "DELETE FROM reservas WHERE id_espacio = $1 RETURNING *",
        [id_espacio_int]
      );

      // Actualizar estado del espacio de estacionamiento a "Disponible"
      const updateEstado = await pool.query(
        "UPDATE espacio_estacionamiento SET estado = $1 WHERE id_espacio = $2",
        ["Disponible", id_espacio_int]
      );
      return res.status(201).json({
        mensaje: "Reserva Eliminada exitosamente",
        reserva: deleteReserva.rows.length > 0 ? deleteReserva.rows[0] : null,
      });
    } else {
      console.log("No se encontró reserva para este espacio");
      return res
        .status(404)
        .json({ error: "No se encontró reserva para este espacio" });
    }
  } catch (error) {
    console.error("Error al eliminar la reserva:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Administración
exports.admin = async (req, res) => {
  try {
    // Se obtienen datos de base de datos
    const { rows: datos_sedes } = await pool.query(
      "SELECT id_sede, nombre_sede FROM sedes ORDER BY id_sede"
    );

    const { rows: datos_edificios } = await pool.query(
      "SELECT id_edificio, nombre_edificio, id_sede AS id_sede_edificio FROM edificios ORDER BY id_edificio"
    );

    const { rows: datos_estacionamietos } = await pool.query(
      "SELECT id_espacio, id_edificio AS id_edificio_estacionamiento FROM espacio_estacionamiento ORDER BY id_espacio"
    );

    // Se envían datos a página
    res.json({
      datos_sedes,
      datos_edificios,
      datos_estacionamietos,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminUpdateSede = async (req, res) => {
  const { updateField, newData, securityToken, updateSede } = req.body;

  console.log("updateField:", updateField);
  console.log("newData:", newData);
  console.log("securityToken:", securityToken);
  console.log("updateSede:", updateSede);

  try {
    if (updateField == "dato1") {
      const result = await pool.query(
        "UPDATE sedes SET nombre_sede=$1 WHERE id_sede= $2",
        [newData, updateSede]
      );
    }

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminUpdateSede");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminUpdateEdificio = async (req, res) => {
  const { updateField, newData, securityToken, updateEdificio } = req.body;

  console.log("updateField:", updateField);
  console.log("newData:", newData);
  console.log("securityToken:", securityToken);
  console.log("updateEdificio:", updateEdificio);

  try {
    if (updateField == "dato1") {
      const result = await pool.query(
        "UPDATE edificios SET nombre_edificio=$1 WHERE id_edificio= $2",
        [newData, updateEdificio]
      );
    }

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminUpdateEdificio");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminUpdateEstacionamiento = async (req, res) => {
  const { updateField, newData, securityToken, updateEstacionamiento } =
    req.body;

  console.log("updateField:", updateField);
  console.log("newData:", newData);
  console.log("securityToken:", securityToken);
  console.log("updateEstacionamiento:", updateEstacionamiento);

  try {
    if (updateField == "dato1") {
      const result = await pool.query(
        "UPDATE espacio_estacionamiento SET tamaño_estacionamiento=$1 WHERE id_espacio= $2",
        [newData, updateEstacionamiento]
      );
    }
    if (updateField == "dato2") {
      const result = await pool.query(
        "UPDATE espacio_estacionamiento SET tipo_vehiculo=$1 WHERE id_espacio= $2",
        [newData, updateEstacionamiento]
      );
    }

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminUpdateEstacionamiento");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminCreateSede = async (req, res) => {
  const { newData, securityToken } = req.body;

  console.log("newData:", newData);
  console.log("securityToken:", securityToken);

  try {
    const result1 = await pool.query(
      "SELECT * FROM sedes WHERE nombre_sede=$1;",
      [newData]
    );

    if (result1.rows.length > 0) {
      console.log("¡La sede ya existe!");
    } else {
      const result2 = await pool.query(
        "INSERT INTO sedes (nombre_sede) VALUES ($1);",
        [newData]
      );
    }

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminCreateSede");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminCreateEdificio = async (req, res) => {
  const { updateSede, newData, securityToken } = req.body;

  console.log("newData:", newData);
  console.log("securityToken:", securityToken);
  console.log("updateSede:", updateSede);

  try {
    const result1 = await pool.query(
      "SELECT * FROM edificios WHERE nombre_edificio=$1;",
      [newData]
    );

    if (result1.rows.length > 0) {
      console.log("¡El edificio ya existe!");
    } else {
      const result2 = await pool.query(
        "INSERT INTO edificios (nombre_edificio, id_sede, cantidad_est) VALUES ($1, $2, $3);",
        [newData, updateSede, 0]
      );
    }

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminCreateEdificios");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminCreateEstacionamiento = async (req, res) => {
  const { updateEdificio, newData, securityToken } = req.body;

  console.log("newData:", newData);
  console.log("securityToken:", securityToken);
  console.log("updateEdificio:", updateEdificio);

  try {
    /*
      const result1 = await pool.query(
          'SELECT * FROM sedes WHERE nombre_sede=$1;',
          [newData]
      );

      if (result1.rows.length > 0) {
          console.log('¡El estacionamiento ya existe!');
      } else {*/
    const result2 = await pool.query(
      "INSERT INTO espacio_estacionamiento (tamaño_estacionamiento, id_edificio, estado, tipo_vehiculo) VALUES ($1, $2, $3, $4);",
      [newData, updateEdificio, "Disponible", "Automóvil"]
    );
    //};

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminCreateEstacionamientos");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminDeleteSede = async (req, res) => {
  const { updateSede, securityToken } = req.body;

  console.log("updateSede:", updateSede);
  console.log("securityToken:", securityToken);

  try {
    // Borra espacios de estacionamiento de sede en cuestión en reservas
    const result1 = await pool.query(
      "DELETE FROM reservas WHERE id_espacio IN (SELECT esp_est.id_espacio FROM sedes, edificios, espacio_estacionamiento AS esp_est WHERE sedes.id_sede=$1 AND esp_est.id_edificio=edificios.id_edificio AND edificios.id_sede=sedes.id_sede);",
      [updateSede]
    );

    // Borra espacios de estacionamiento de sede en cuestión
    const result2 = await pool.query(
      "DELETE FROM espacio_estacionamiento WHERE id_espacio IN (SELECT esp_est.id_espacio FROM sedes, edificios, espacio_estacionamiento AS esp_est WHERE sedes.id_sede=$1 AND esp_est.id_edificio=edificios.id_edificio AND edificios.id_sede=sedes.id_sede);",
      [updateSede]
    );

    // Borra edificios de sede en cuestión en guardias
    const result3 = await pool.query(
      "DELETE FROM guardias WHERE id_edificio IN (SELECT edificios.id_edificio FROM sedes, edificios WHERE sedes.id_sede=$1 AND edificios.id_sede=sedes.id_sede);",
      [updateSede]
    );

    // Borra edificios de sede en cuestión
    const result4 = await pool.query(
      "DELETE FROM edificios WHERE id_edificio IN (SELECT edificios.id_edificio FROM sedes, edificios WHERE sedes.id_sede=$1 AND edificios.id_sede=sedes.id_sede);",
      [updateSede]
    );

    // Borra sede en cuestión
    const result5 = await pool.query("DELETE FROM sedes WHERE id_sede=$1;", [
      updateSede,
    ]);

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminDeleteSede");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminDeleteEdificio = async (req, res) => {
  const { updateEdificio, securityToken } = req.body;

  console.log("updateEdificio:", updateEdificio);
  console.log("securityToken:", securityToken);

  try {
    // Borra espacios de estacionamiento de edificio en cuestión en reservas
    const result1 = await pool.query(
      "DELETE FROM reservas WHERE id_espacio IN (SELECT esp_est.id_espacio FROM edificios, espacio_estacionamiento AS esp_est WHERE edificios.id_edificio=$1 AND esp_est.id_edificio=edificios.id_edificio);",
      [updateEdificio]
    );

    // Borra espacios de estacionamiento de edificio en cuestión
    const result2 = await pool.query(
      "DELETE FROM espacio_estacionamiento WHERE id_espacio IN (SELECT esp_est.id_espacio FROM edificios, espacio_estacionamiento AS esp_est WHERE edificios.id_edificio=$1 AND esp_est.id_edificio=edificios.id_edificio);",
      [updateEdificio]
    );

    // Borra edificio en cuestión en guardias
    const result3 = await pool.query(
      "DELETE FROM guardias WHERE id_edificio IN (SELECT edificios.id_edificio FROM edificios WHERE edificios.id_edificio=$1);",
      [updateEdificio]
    );

    // Borra edificio en cuestión
    const result4 = await pool.query(
      "DELETE FROM edificios WHERE id_edificio=$1;",
      [updateEdificio]
    );

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminDeleteEdificio");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.adminDeleteEstacionamiento = async (req, res) => {
  const { updateEstacionamiento, securityToken } = req.body;

  console.log("updateEstacionamiento:", updateEstacionamiento);
  console.log("securityToken:", securityToken);

  try {
    // Borra espacio de estacionamiento en cuestión en reservas
    const result1 = await pool.query(
      "DELETE FROM reservas WHERE id_espacio=$1;",
      [updateEstacionamiento]
    );

    // Borra espacio de estacionamiento en cuestión
    const result2 = await pool.query(
      "DELETE FROM espacio_estacionamiento WHERE id_espacio=$1;",
      [updateEstacionamiento]
    );

    //res.send('Datos recibidos y procesados con éxito');
    console.log("En adminDeleteEstacionamiento");
    res.redirect("/admin1.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};
exports.selectEstacionamientoEstado = async (req, res) => {
  try {
    // Consulta para obtener los vehículos del usuario
    const result = await pool.query(
      "SELECT id_espacio, estado, id_edificio FROM espacio_estacionamiento;"
    );

    //console.log("resultado de consulta en controller:",result.rows); // Muestra los resultados en la consola para depuración
    res.json(result.rows); // Envía los vehículos como respuesta JSON
  } catch (err) {
    console.error("Error al obtener estacionamientos:", err);
    res.status(500).send("Error al obtener los estacionamientos");
  }
};

exports.reporteGuardiaSelect = async (req, res) => {
  const id_usuario = global.usuarioId;
  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    const result = await pool.query(
      "SELECT reporte from reportes R join poseer_vehiculo PV on R.patente=PV.patente where id_usuario=$1 ",
      [id_usuario]
    );

    const reporteEncontrado = result.rows[0];
    res.status(201).json({
      mensaje: "Reporte encontrado",
      reserva: reporteEncontrado,
    });
  } catch (error) {
    console.error("Error al encontrar el reporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};