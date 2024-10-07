import {
  SP_ACTUALIZAR_USUARIO,
  SP_ELIMINAR_USUARIO,
  SP_GUARDAR_USUARIO,
  SP_HORARIO_LABORAL,
  SP_OBTENER_CITAS,
  SP_OBTENER_CLIENTES,
  SP_OBTENER_PROVEEDORES,
  SP_OBTENER_PROVEEDORES_POR_SERVICIO,
  SP_OBTENER_USUARIO,
  SP_OBTENER_USUARIOS,
} from "../utils/sp.js";
import { ejecutarSP } from "../data/dbConexion.js";

import { diaMap } from "../utils/diasDeLaSemana.js";

import bcrypt from "bcryptjs";
import generadorCorreo from "../utils/generadorCorreo.js";
import generarPassword from "../utils/generarPassword.js";

export const getProveedoresPorServicio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const proveedores = await ejecutarSP(SP_OBTENER_PROVEEDORES_POR_SERVICIO, [
      id,
    ]);
    res.json({
      resultado: proveedores,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener los proveedores, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getProveedores = async (req, res, next) => {
  try {
    const usuario = req.usuario;
    const proveedores = await ejecutarSP(SP_OBTENER_PROVEEDORES, [
      usuario.rol,
      usuario.id,
    ]);
    res.json({
      resultado: proveedores,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener los proveedores, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getCitas = async (req, res, next) => {
  try {
    const usuario = req.usuario;

    const citas = await ejecutarSP(SP_OBTENER_CITAS, [usuario.rol, usuario.id]);
    res.json({
      resultado: citas,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener las citas, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getHorarioLaboral = async (req, res, next) => {
  try {
    const horariolaboral = await ejecutarSP(SP_HORARIO_LABORAL);
    // Función para convertir el string de "09:00" a un objeto Date en un día específico
    const convertirHora = (hora) => {
      const fecha = new Date();
      const [hours, minutes] = hora?.split(":")?.map(Number);

      fecha.setHours(hours, minutes, 0, 0); // Establece las horas localmente
      return fecha;
    };

    const horario = JSON.parse(horariolaboral[0].valor);

    // formatear el horario
    const horariosPorDia = Object.keys(horario).reduce((acc, dia, index) => {
      const dataDia = horario[dia];

      if (dataDia) {
        const descanso = dataDia?.descanso?.map((d) => {
          const minHora = convertirHora(d.inicio);
          const maxHora = convertirHora(d.fin);
          const inicioDescanso = minHora.getHours() * 60 + minHora.getMinutes();
          const finDescanso = maxHora.getHours() * 60 + maxHora.getMinutes();
          return [inicioDescanso, finDescanso];
        });

        const minHora = convertirHora(dataDia.inicio);
        const maxHora = convertirHora(dataDia.fin);

        acc[diaMap[dia]] = {
          min: minHora.getHours() * 60 + minHora.getMinutes(),
          max: maxHora.getHours() * 60 + maxHora.getMinutes(),
          descanso,
        };
      } else {
        acc[diaMap[dia]] = null; // Si no hay horario, lo deja como null
      }

      return acc;
    }, {});

    res.json({
      resultado: horariosPorDia,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener el horario laboral, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getClientes = async (req, res, next) => {
  try {
    const clientes = await ejecutarSP(SP_OBTENER_CLIENTES);
    res.json({
      resultado: clientes,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener clientes, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await ejecutarSP(SP_OBTENER_USUARIOS);
    res.json({
      resultado: usuarios,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener usuarios, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const guardarUsuario = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      privado,
      servicios,
    } = req.body;

    const serviciosSeleccionados = JSON.stringify(servicios);

    // Generar una nueva contraseña temporal
    const passwordTextoPlano = generarPassword();
    // Encriptar la contraseña
    // encriptacion de contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(passwordTextoPlano, salt);

    const resultado = await ejecutarSP(SP_GUARDAR_USUARIO, [
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      privado,
      serviciosSeleccionados,
      password,
    ]);

    if (resultado && resultado[0]?.existeUsername) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El nombre de usuario ya existe`,
      });
    }

    if (resultado && resultado[0]?.existeEmail) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El correo electronico del usuario ya existe`,
      });
    }

    const nombreEmpresa = "THE KING BARBER";
    const titulo = "Creación de perfil";
    const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Hola ${nombre},</h2>
          <p style="color: #555; font-size: 16px;">Hemos creado tu perfil. Aquí están los detalles:</p>
          <ul style="color: #555; font-size: 16px; line-height: 1.6;">
            <li><strong>Nombre:</strong> ${nombre} ${apellido}</li>
            <li><strong>Correo electrónico:</strong> ${email}</li>
            <li><strong>Teléfono:</strong> ${telefono}</li>
            <li><strong>Dirección:</strong> ${direccion}</li>
          </ul>
          <p style="color: #555; font-size: 16px;">Aquí está tu contraseña temporal:</p>
          <p style="background-color: #f8d7da; color: #721c24; padding: 10px 20px; border-radius: 5px; font-size: 18px; text-align: center;">
            <strong>${passwordTextoPlano}</strong>
          </p>
          <p style="color: #555; font-size: 16px;">Te recomendamos cambiarla al actualizar tu usuario.</p>
          <p style="color: #555; font-size: 16px;">Saludos,</p>
          <p style="color: #333; font-size: 16px; font-weight: bold;">El equipo de ${nombreEmpresa}</p>
        </div>
      </body>
    </html>
  `;

    await generadorCorreo(titulo, htmlContent, email, nombre);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Usuario creado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const actualizarUsuario = async (req, res, next) => {
  try {
    const {
      idUsuario,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      privado,
      servicios,
      actualizarPassword,
    } = req.body;

    const serviciosSeleccionados = JSON.stringify(servicios);

    let password = null;
    let passwordTextoPlano = null;

    if (actualizarPassword) {
      // Generar una nueva contraseña temporal
      passwordTextoPlano = generarPassword();
      // Encriptar la contraseña
      // encriptacion de contraseña
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(passwordTextoPlano, salt);
    }

    const resultado = await ejecutarSP(SP_ACTUALIZAR_USUARIO, [
      idUsuario,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      privado,
      serviciosSeleccionados,
      password,
    ]);

    if (resultado && resultado[0]?.existeUsername) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El nombre de usuario ya existe`,
      });
    }

    if (resultado && resultado[0]?.existeEmail) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El correo electronico del usuario ya existe`,
      });
    }

    const nombreEmpresa = "THE KING BARBER";

    // Si la contraseña fue actualizada, enviar correo con la nueva contraseña
    if (actualizarPassword && passwordTextoPlano) {
      const titulo = "Actualización de perfil";
      const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Hola ${nombre},</h2>
          <p style="color: #555; font-size: 16px;">Hemos realizado actualizaciones a tu perfil. Aquí están los detalles:</p>
          <ul style="color: #555; font-size: 16px; line-height: 1.6;">
            <li><strong>Nombre:</strong> ${nombre} ${apellido}</li>
            <li><strong>Correo electrónico:</strong> ${email}</li>
            <li><strong>Teléfono:</strong> ${telefono}</li>
            <li><strong>Dirección:</strong> ${direccion}</li>
          </ul>
          <p style="color: #555; font-size: 16px;">Como parte de esta actualización, tu contraseña ha sido cambiada. Aquí está tu nueva contraseña temporal:</p>
          <p style="background-color: #f8d7da; color: #721c24; padding: 10px 20px; border-radius: 5px; font-size: 18px; text-align: center;">
            <strong>${passwordTextoPlano}</strong>
          </p>
          <p style="color: #555; font-size: 16px;">Te recomendamos cambiarla al actualizar tu usuario.</p>
          <p style="color: #555; font-size: 16px;">Saludos,</p>
          <p style="color: #333; font-size: 16px; font-weight: bold;">El equipo de ${nombreEmpresa}</p>
        </div>
      </body>
    </html>
  `;

      await generadorCorreo(titulo, htmlContent, email, nombre);
    } else {
      // Si no se actualizó la contraseña, enviar un correo con los demás cambios
      const titulo = "Actualización de perfil";
      const htmlContent = `
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333;">Hola ${nombre},</h2>
          <p style="color: #555; font-size: 16px;">Hemos realizado actualizaciones a tu perfil. Aquí están los detalles:</p>
          <ul style="color: #555; font-size: 16px; line-height: 1.6;">
            <li><strong>Nombre:</strong> ${nombre} ${apellido}</li>
            <li><strong>Correo electrónico:</strong> ${email}</li>
            <li><strong>Teléfono:</strong> ${telefono}</li>
            <li><strong>Dirección:</strong> ${direccion}</li>
          </ul>
          <p style="color: #555; font-size: 16px;">Saludos,</p>
          <p style="color: #333; font-size: 16px; font-weight: bold;">El equipo de ${nombreEmpresa}</p>
        </div>
      </body>
    </html>
  `;

      await generadorCorreo(titulo, htmlContent, email, nombre);
    }

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Usuario actualizado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const eliminarUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    await ejecutarSP(SP_ELIMINAR_USUARIO, [id]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Usuario eliminado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const getUsuario = async (req, res, next) => {
  const usuario = req.usuario;
  try {
    const resultado = await ejecutarSP(SP_OBTENER_USUARIO, [usuario.id]);
    res.json({
      resultado: resultado[0],
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener usuarios, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const actualizarPerfil = async (req, res, next) => {
  try {
    const {
      idUsuario,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      password,
    } = req.body;

    const usuario = req.usuario;

    // encriptacion de contraseña
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);

    const resultado = await ejecutarSP(SP_ACTUALIZAR_USUARIO, [
      usuario.id,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      username,
      false,
      "[]",
      pass,
    ]);

    if (resultado && resultado[0]?.existeUsername) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El nombre de usuario ya existe`,
      });
    }

    if (resultado && resultado[0]?.existeEmail) {
      return res.json({
        resultado: null,
        ocurrioError: true,
        mensaje: `El correo electronico del usuario ya existe`,
      });
    }

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Perfil actualizado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};
