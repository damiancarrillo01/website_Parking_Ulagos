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

  console.log("Correo:", correo);
  console.log("Contraseña:", contraseña);

  try {
    if (
      correo.endsWith("@alumnos.ulagos.cl") ||
      correo.endsWith("@ulagos.cl")
    ) {
      global.result = await pool.query(
        "SELECT id_usuario, correo, contraseña, tipo_usuario FROM Usuarios WHERE correo = $1 AND contraseña = $2",
        [correo, contraseña]
      );
    } else {
      global.result = await pool.query(
        "SELECT id_guardia, correo, contraseña FROM Guardias WHERE correo = $1 AND contraseña = $2",
        [correo, contraseña],
        (global.tipoUsuario = "guardia")
      );
    }
    if (result.rows.length > 0) {
      global.usuarioId = global.result.rows[0].id_usuario;
      console.log("ID de Usuario:", global.usuarioId); // Corrección aquí
      console.log("Tipo de Usuario:", global.tipoUsuario);
      if (tipoUsuario == "guardia") {
        res.json({ tipo_usuario: global.tipoUsuario }); // Enviar tipo_usuario como JSON
      } else {
        res.json({ tipo_usuario: rows[0].tipoUsuario }); // Enviar tipo_usuario como JSON
      }
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
