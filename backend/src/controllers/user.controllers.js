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

    // Consulta para usuarios normales (alumnos.ulagos.cl, ulagos.cl)
    if (
      correo.endsWith("@alumnos.ulagos.cl") ||
      correo.endsWith("@ulagos.cl")
    ) {
      result = await pool.query(
        "SELECT id_usuario, correo, contraseña, tipo_usuario FROM Usuarios WHERE correo = $1 AND contraseña = $2",
        [correo, contraseña]
      );
      if (result.rows.length > 0) {
        global.usuarioId = result.rows[0].id_usuario;
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
        global.usuarioId = result.rows[0].id_guardia;
        tipoUsuario = "guardia";
      }
    }

    if (result.rows.length > 0) {
      console.log("ID de Usuario:", global.usuarioId);
      console.log("Tipo de Usuario:", tipoUsuario);

      // Redirigir según el tipo de usuario
      res.json({ tipo_usuario: tipoUsuario, redirectUrl: "/sedes.html" });
    } else {
      res.status(400).send("Este usuario no existe");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};

exports.sedes = async (req, res) => {
  const idboton = req.body;
  const id_usuario = global.usuarioId;
  console.log(idboton);
  console.log("ID de Usuario en sedes:", id_usuario);
  if (!id_usuario) {
    return res.status(401).send("Usuario no autenticado");
  }

  try {
    // Realiza cualquier lógica adicional si es necesario

    // Responder con un JSON que indique al frontend que redirija
    res.status(200).json({ redirectUrl: "/principal.html" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error procesando los datos");
  }
};
exports.registroAuto = async (req, res) => {
  const { patente, tipo_vehiculo, color, modelo, tamaño } = req.body;
  const id_usuario = global.usuarioId;
  console.log("usuarioid", id_usuario);
  console.log("patente:", patente);
  console.log("tipo_vehiculo:", tipo_vehiculo);
  console.log("color:", color);
  console.log("modelo:", modelo);
  console.log("tamaño:", tamaño);

  // Validaciones básicas
  if (!patente || !tipo_vehiculo || !color || !modelo || !tamaño) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (!id_usuario) {
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
      [id_usuario, patente]
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
  const id_usuario = global.usuarioId; // Obtén el ID del usuario de la sesión
  console.log(id_usuario);
  // Verifica si el usuario está autenticado
  if (!id_usuario) {
    return res.status(401).send("Usuario no autenticado");
  }

  try {
    // Consulta para obtener los vehículos del usuario
    const result = await pool.query(
      "SELECT p.patente, v.tipo_vehiculo, v.color, v.modelo, v.tamaño FROM Vehiculo v JOIN poseer_vehiculo p ON p.patente = v.patente WHERE p.id_usuario = $1",
      [id_usuario]
    );

    console.log(result.rows); // Muestra los resultados en la consola para depuración
    res.json(result.rows); // Envía los vehículos como respuesta JSON
  } catch (err) {
    console.error("Error al obtener los vehículos:", err);
    res.status(500).send("Error al obtener los vehículos");
  }
};
exports.reserva = async (req, res) => {
  const { edificio, patente, id_espacio, hora_entrada, hora_salida } = req.body;
  const id_usuario = global.usuarioId;

  console.log("usuarioid : ", id_usuario);
  console.log("Edificio : ", edificio);
  console.log("hora entrada : ", hora_entrada);
  console.log("hora salida : ", hora_salida);
  console.log("Espacio : ", id_espacio);

  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  // Validaciones básicas
  if (!edificio || !patente || !hora_entrada || !hora_salida) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Select para verificar si ya existe una reserva
    const resultUsu = await pool.query(
      "SELECT id_usuario FROM reservas WHERE id_usuario = $1",
      [id_usuario]
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

      // Ahora hora_entrada_completa y hora_salida_completa deberían estar en formato ISO8601 compatible
      // para insertar en SQL sin problemas de zona horaria.

      const result = await pool.query(
        "INSERT INTO reservas (id_edificio, id_espacio, id_usuario, patente, hora_entrada_reserva, hora_salida_reserva) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [
          id_edificio.rows[0].id_edificio,
          id_espacio_int,
          id_usuario,
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
exports.eliminarReserva = async (req, res) => {
  const { patente, id_espacio } = req.body;
  const id_usuario = global.usuarioId;

  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Select para verificar si ya existe una reserva
    const resultUsu = await pool.query(
      "SELECT id_usuario FROM reservas WHERE id_usuario = $1",
      [id_usuario]
    );

    if (resultUsu.rows.length > 0) {
      const DeleteReserva = await pool.query(
        "DELETE FROM  reservas WHERE id_usuario = $1 and patente= $2",
        [id_usuario, patente]
      );
      const updateEstado = await pool.query(
        "UPDATE espacio_estacionamiento SET estado=$1 WHERE id_espacio = $2",
        ["Disponible", id_espacio_int]
      );

      const reservaEliminada = DeleteReserva.rows[0];
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
  const id_usuario = global.usuarioId;

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    const resultReserva = await pool.query(
      "SELECT r.id_edificio, r.id_reserva, e.nombre_edificio," +
        " r.id_espacio, r.id_usuario, r.patente, r.hora_entrada_reserva, r.hora_salida_reserva " +
        "FROM reservas r " +
        "JOIN edificios e ON r.id_edificio = e.id_edificio " +
        "WHERE r.id_usuario = $1",
      [id_usuario]
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

exports.actualizarReserva = async (req, res) => {
  const { patente, id_espacio } = req.body;
  const id_usuario = global.usuarioId;

  // Convertir id_espacio a entero
  const id_espacio_int = parseInt(id_espacio, 10); // Base 10

  if (!id_usuario) {
    return res.status(400).json({ error: "Usuario no autenticado" });
  }

  try {
    // Verificar si existe la reserva y obtener la hora de salida actual
    const resultReserva = await pool.query(
      "SELECT hora_salida_reserva FROM reservas WHERE id_usuario = $1 AND patente = $2 AND id_espacio = $3",
      [id_usuario, patente, id_espacio_int]
    );

    if (resultReserva.rows.length > 0) {
      const { hora_salida_reserva } = resultReserva.rows[0];

      // Aumentar la hora de salida en una hora
      const horaSalidaActual = new Date(hora_salida_reserva);
      horaSalidaActual.setHours(horaSalidaActual.getHours() + 1); // Aumentar en una hora

      // Actualizar la reserva con la nueva hora de salida
      const updateReserva = await pool.query(
        "UPDATE reservas SET hora_salida_reserva = $1 WHERE id_usuario = $2 AND patente = $3 AND id_espacio = $4 RETURNING *",
        [horaSalidaActual, id_usuario, patente, id_espacio_int]
      );

      if (updateReserva.rows.length > 0) {
        const reservaActualizada = updateReserva.rows[0];
        res.status(201).json({
          mensaje: "Reserva aumentada exitosamente",
          nueva_hora_salida: reservaActualizada.hora_salida_reserva.toISOString(), // Devuelve la nueva hora de salida en formato ISO8601
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