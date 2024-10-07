import {
  SP_CANCELAR_CITA,
  SP_CITAS_RESERVADAS,
  SP_CITAS_RESERVADAS_POR_FECHA,
  SP_GUARDAR_CITA,
  SP_GUARDAR_CITA_CLIENTE,
  SP_GUARDAR_TOKEN_CITA,
  SP_HORARIO_LABORAL,
  SP_OBTENER_BITACORA_CITAS,
} from "../utils/sp.js";
import { ejecutarSP } from "../data/dbConexion.js";
const diasDeLaSemana = {
  0: "lunes",
  1: "martes",
  2: "miercoles",
  3: "jueves",
  4: "viernes",
  5: "sabado",
  6: "domingo",
};

import generadorDeCodigo from "../utils/generadorDeCodigo.js";
import generadorCorreo from "../utils/generadorCorreo.js";

// Función para formatear la fecha al formato requerido por Google Calendar
function formatDateToGoogleCalendar(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

// Función para generar el enlace de Google Calendar
function generateGoogleCalendarLink({
  nombreEmpresa,
  fechaInicio,
  fechaFin,
  notas,
}) {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const text = `Cita agendada en ${encodeURIComponent(nombreEmpresa)}`;
  const dates = `${formatDateToGoogleCalendar(
    fechaInicio
  )}/${formatDateToGoogleCalendar(fechaFin)}`;
  const location = encodeURIComponent(nombreEmpresa);
  const details = encodeURIComponent(notas);

  return `${baseUrl}&text=${text}&dates=${dates}&location=${location}&details=${details}`;
}

export const getCitasReservadasProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const citasReservadas = await ejecutarSP(SP_CITAS_RESERVADAS, [id]);

    const resultado = await ejecutarSP(SP_HORARIO_LABORAL);

    const horarioLaboral = JSON.parse(resultado[0].valor);

    // Objeto para agrupar las citas por día
    const duracionesPorDia = {};

    //lista de dias reservados
    const diasReservados = [];

    citasReservadas.forEach((fechaCita) => {
      const fecha = new Date(fechaCita.fechaInicio).toString();
      let dia = new Date(fechaCita.fechaInicio).getDay();
      dia = diasDeLaSemana[dia];

      const horario = horarioLaboral[dia];

      const inicioHoras = new Date(fechaCita.fechaInicio).getHours();
      const inicioMinutos = new Date(fechaCita.fechaInicio).getMinutes();
      const finHoras = new Date(fechaCita.fechaFin).getHours();
      const finMinutos = new Date(fechaCita.fechaFin).getMinutes();

      const minutosInicio = inicioHoras * 60 + inicioMinutos;
      const minutosFin = finHoras * 60 + finMinutos;

      const duracionCita = minutosFin - minutosInicio;

      // Agregar la duración de la cita al día correspondiente
      if (!duracionesPorDia[fecha]) {
        duracionesPorDia[fecha] = duracionCita;
      } else {
        duracionesPorDia[fecha] += duracionCita;
      }

      // Calcular la duración total del día laboral
      if (horario) {
        let [inicioHoras, inicioMinutos] = horario.inicio
          ?.split(":")
          .map(Number);
        let [finHoras, finMinutos] = horario.fin?.split(":").map(Number);

        // Convertir las horas de inicio y fin a minutos
        const minutosInicioLaboral = inicioHoras * 60 + inicioMinutos;
        const minutosFinLaboral = finHoras * 60 + finMinutos;

        // Calcular la duración total del día en minutos
        let duracionTotalLaboral = minutosFinLaboral - minutosInicioLaboral;

        // Restar los descansos
        if (horario.descanso) {
          horario.descanso.forEach((descanso) => {
            const [inicioDescansoHoras, inicioDescansoMinutos] = descanso.inicio
              .split(":")
              .map(Number);
            const [finDescansoHoras, finDescansoMinutos] = descanso.fin
              .split(":")
              .map(Number);

            const minutosInicioDescanso =
              inicioDescansoHoras * 60 + inicioDescansoMinutos;
            const minutosFinDescanso =
              finDescansoHoras * 60 + finDescansoMinutos;

            // Restar el descanso de la duración total
            duracionTotalLaboral -= minutosFinDescanso - minutosInicioDescanso;
          });
        }

        if (duracionesPorDia[fecha] >= duracionTotalLaboral) {
          diasReservados.push(fecha);
        }
      }
    });

    res.json({
      resultado: diasReservados,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getdiasNoLaborales = async (req, res, next) => {
  try {
    const horario = await ejecutarSP(SP_HORARIO_LABORAL);

    const horarioLaboral = JSON.parse(horario[0].valor);
    const diasNoLaborales = [];

    Object.entries(horarioLaboral).forEach((x) => {
      const [clave, valor] = x;
      if (!valor) diasNoLaborales.push(clave);
    });

    res.json({
      resultado: diasNoLaborales,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta de nuevo o mas tarde"
    );
    next(error);
  }
};

export const getHorarioDisponiblePorFecha = async (req, res, next) => {
  try {
    let { fecha, idProveedor, duracionServicio } = req.query;

    duracionServicio = parseInt(duracionServicio);

    const diaSemana = new Date(fecha).getDay();
    const citasReservadas = await ejecutarSP(SP_CITAS_RESERVADAS_POR_FECHA, [
      fecha,
      idProveedor,
    ]);

    const resultado = await ejecutarSP(SP_HORARIO_LABORAL);
    const horarioLaboral = JSON.parse(resultado[0].valor);

    const dia = diasDeLaSemana[diaSemana];

    const horario = horarioLaboral[dia];

    if (!horario) {
      return res.json([]); // No hay horario laboral para este día
    }

    // Crear rangos de 15 minutos dentro del horario laboral
    let intervalos = [];
    if (horario?.inicio) {
      const [inicioHoras, inicioMinutos] = horario.inicio
        .split(":")
        .map(Number);
      const [finHoras, finMinutos] = horario.fin.split(":").map(Number);
      let minutosActuales = inicioHoras * 60 + inicioMinutos;
      let minutosFinLaboral = finHoras * 60 + finMinutos;

      while (minutosActuales + 15 <= minutosFinLaboral) {
        // Verificar que el servicio completo (inicio + duración) no exceda el horario laboral
        if (minutosActuales + duracionServicio <= minutosFinLaboral) {
          intervalos.push(minutosActuales);
        }
        minutosActuales += 15;
      }
    }

    // Restar los intervalos que caen dentro de los descansos
    if (horario?.descanso) {
      horario.descanso.forEach((descanso) => {
        const [inicioDescansoHoras, inicioDescansoMinutos] = descanso.inicio
          .split(":")
          .map(Number);
        const [finDescansoHoras, finDescansoMinutos] = descanso.fin
          .split(":")
          .map(Number);

        const minutosInicioDescanso =
          inicioDescansoHoras * 60 + inicioDescansoMinutos;
        const minutosFinDescanso = finDescansoHoras * 60 + finDescansoMinutos;

        // Filtrar los intervalos que caen dentro del descanso
        intervalos = intervalos.filter(
          (minutos) =>
            minutos < minutosInicioDescanso || minutos >= minutosFinDescanso
        );
      });
    }

    /// Verificar los horarios ocupados y filtrar los intervalos disponibles
    citasReservadas?.forEach((reserva) => {
      const inicioReserva =
        new Date(reserva.fechaInicio).getHours() * 60 +
        new Date(reserva.fechaInicio).getMinutes();
      const finReserva =
        new Date(reserva.fechaFin).getHours() * 60 +
        new Date(reserva.fechaFin).getMinutes();

      intervalos = intervalos.filter(
        (minutos) =>
          minutos + duracionServicio <= inicioReserva || minutos >= finReserva
      );
    });

    // Convertir los intervalos disponibles a formato de horas y minutos
    const horariosDisponibles = intervalos.map((minutos) => {
      const horas = Math.floor(minutos / 60)
        .toString()
        .padStart(2, "0");
      const minutosStr = (minutos % 60).toString().padStart(2, "0");
      return `${horas}:${minutosStr}`;
    });

    res.json({
      resultado: horariosDisponibles,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, al obtener el horario, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};
export const guardarCita = async (req, res, next) => {
  try {
    const {
      idServicio,
      duracionServicio,
      idProveedor,
      fechaInicio,
      hora,
      nombreCliente,
      apellidoCliente,
      correoCliente,
      telefonoCliente,
      notasCLiente,
      fechaFin,
    } = req.body;

    const fechaInicioCompleta = new Date(fechaInicio);
    const fechaFinal = new Date(fechaFin);

    await ejecutarSP(SP_GUARDAR_CITA, [
      idServicio,
      idProveedor,
      fechaInicioCompleta,
      fechaFinal,
      nombreCliente,
      apellidoCliente,
      correoCliente,
      telefonoCliente,
      notasCLiente,
    ]);

    const nombreEmpresa = "THE KING BARBER";

    // Generar el enlace de Google Calendar
    const googleCalendarLink = generateGoogleCalendarLink({
      nombreEmpresa,
      fechaInicio: fechaInicioCompleta,
      fechaFin: fechaFinal,
      notas: notasCLiente,
    });

    const titulo = `Tu cita con ${nombreEmpresa} ha sido confirmada`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
            <img src="https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/302075580_591681799070646_3545406768882047780_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rbd7EIrYOEEQ7kNvgHKnpsk&_nc_ht=scontent-dfw5-2.xx&_nc_gid=Ak6eBvjKhx9YYuLU6wOQIrH&oh=00_AYD9_zvVllLGg6Gm5e2BJDjx6YlRHhq7YrGLl45hhBcLMA&oe=6702C348" 
                 alt="${nombreEmpresa}" style="width: 150px; margin-bottom: 20px;" />
            <h1 style="color: #333;">¡Hola, ${nombreCliente}!</h1>
            <p style="font-size: 16px; color: #555;">Tu cita con <strong>${nombreEmpresa}</strong> ha sido confirmada.</p>
            <p style="font-size: 16px; color: #555;">Detalles de la cita:</p>
            <table style="width: 100%; margin-top: 20px; text-align: left; font-size: 14px;">
              <tr>
                <td><strong>Fecha:</strong></td>
                <td>${fechaInicioCompleta.toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Hora de inicio:</strong></td>
                <td>${fechaInicioCompleta.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</td>
              </tr>
              <tr>
                <td><strong>Hora de finalización:</strong></td>
                <td>${fechaFinal.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</td>
              </tr>
              <tr>
                <td><strong>Cliente:</strong></td>
                <td>${nombreCliente} ${apellidoCliente}</td>
              </tr>
              <tr>
                <td><strong>Teléfono:</strong></td>
                <td>${telefonoCliente}</td>
              </tr>
              <tr>
                <td><strong>Notas:</strong></td>
                <td>${notasCLiente || "Ninguna"}</td>
              </tr>
            </table>
            <p style="font-size: 16px; color: #555;">Puedes guardar un rocordatorio en el siguiente enlace:</p>
            <div style="margin-top: 30px;">
              <a href="${googleCalendarLink}" target="_blank" style="padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Añadir a Google Calendar</a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">Si no realizaste esta reservación, por favor contacta con nosotros.</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">Saludos,<br>El equipo de ${nombreEmpresa}</p>
          </div>
        </body>
      </html>
    `;

    await generadorCorreo(titulo, htmlContent, correoCliente, nombreCliente);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Cita reservada exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const guardarCitaCliente = async (req, res, next) => {
  try {
    const {
      idServicio,
      duracionServicio,
      idProveedor,
      fechaInicio,
      hora,
      nombreCliente,
      apellidoCliente,
      correoCliente,
      telefonoCliente,
      notasCLiente,
      token,
    } = req.body;

    const fechaInicioCompleta = new Date(`${fechaInicio}T${hora}`);

    // Calcular la fecha final sumando la duración del servicio (en minutos)
    let fechaFinal = new Date(fechaInicioCompleta);
    fechaFinal.setMinutes(fechaFinal.getMinutes() + duracionServicio);

    await ejecutarSP(SP_GUARDAR_CITA_CLIENTE, [
      idServicio,
      idProveedor,
      fechaInicioCompleta,
      fechaFinal,
      nombreCliente,
      apellidoCliente,
      correoCliente,
      telefonoCliente,
      notasCLiente,
      token,
    ]);

    const nombreEmpresa = "THE KING BARBER";

    // Generar el enlace de Google Calendar
    const googleCalendarLink = generateGoogleCalendarLink({
      nombreEmpresa,
      fechaInicio: fechaInicioCompleta,
      fechaFin: fechaFinal,
      notas: notasCLiente,
    });

    const titulo = `Tu cita con ${nombreEmpresa} ha sido confirmada`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
            <img src="https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/302075580_591681799070646_3545406768882047780_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rbd7EIrYOEEQ7kNvgHKnpsk&_nc_ht=scontent-dfw5-2.xx&_nc_gid=Ak6eBvjKhx9YYuLU6wOQIrH&oh=00_AYD9_zvVllLGg6Gm5e2BJDjx6YlRHhq7YrGLl45hhBcLMA&oe=6702C348" 
                 alt="${nombreEmpresa}" style="width: 150px; margin-bottom: 20px;" />
            <h1 style="color: #333;">¡Hola, ${nombreCliente}!</h1>
            <p style="font-size: 16px; color: #555;">Tu cita con <strong>${nombreEmpresa}</strong> ha sido confirmada.</p>
            <p style="font-size: 16px; color: #555;">Detalles de la cita:</p>
            <table style="width: 100%; margin-top: 20px; text-align: left; font-size: 14px;">
              <tr>
                <td><strong>Fecha:</strong></td>
                <td>${fechaInicioCompleta.toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Hora de inicio:</strong></td>
                <td>${fechaInicioCompleta.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</td>
              </tr>
              <tr>
                <td><strong>Hora de finalización:</strong></td>
                <td>${fechaFinal.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</td>
              </tr>
              <tr>
                <td><strong>Cliente:</strong></td>
                <td>${nombreCliente} ${apellidoCliente}</td>
              </tr>
              <tr>
                <td><strong>Teléfono:</strong></td>
                <td>${telefonoCliente}</td>
              </tr>
              <tr>
                <td><strong>Notas:</strong></td>
                <td>${notasCLiente || "Ninguna"}</td>
              </tr>
            </table>
            <p style="font-size: 16px; color: #555;">Puedes guardar un rocordatorio en el siguiente enlace:</p>
            <div style="margin-top: 30px;">
              <a href="${googleCalendarLink}" target="_blank" style="padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Añadir a Google Calendar</a>
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">Si no realizaste esta reservación, por favor contacta con nosotros.</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">Saludos,<br>El equipo de ${nombreEmpresa}</p>
          </div>
        </body>
      </html>
    `;

    await generadorCorreo(titulo, htmlContent, correoCliente, nombreCliente);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Cita reservada exitosamente`,
    });
  } catch (err) {
    console.log(err);
    if (
      err
        .toString()
        .includes("Token de verificación no válido o no encontrado.")
    ) {
      const error = new Error(
        "Token de verificación no válido o no encontrado."
      );
      return next(error);
    }
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const preGuardarCitaCliente = async (req, res, next) => {
  try {
    const { correoCliente, nombre } = req.body;

    const token = generadorDeCodigo();

    const titulo = `Verificación de token para confirmar cita`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/302075580_591681799070646_3545406768882047780_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rbd7EIrYOEEQ7kNvgHKnpsk&_nc_ht=scontent-dfw5-2.xx&_nc_gid=Ak6eBvjKhx9YYuLU6wOQIrH&oh=00_AYD9_zvVllLGg6Gm5e2BJDjx6YlRHhq7YrGLl45hhBcLMA&oe=6702C348" alt="THE KING BARBER" style="width: 150px; margin-bottom: 20px;" />
            <h1 style="color: #333;">Hola, ${nombre}!</h1>
            <p style="font-size: 16px; color: #555;">Recibimos una solicitud para reservar una cita.</p>
            <p style="font-size: 16px; color: #555;">Por favor, introduce el siguiente código de verificación para continuar:</p>
            <div style="background-color: #007bff; color: #fff; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 5px; display: inline-block; margin-top: 20px;">
              ${token}
            </div>
            <p style="font-size: 14px; color: #888; margin-top: 20px;">Si no solicitaste este código, por favor ignora este mensaje, y ponte en contacto con el administrador.</p>
            <p style="font-size: 16px; color: #333; margin-top: 30px;">Saludos,<br>El equipo de THE KING BARBER</p>
          </div>
        </body>
      </html>
    `;

    await generadorCorreo(titulo, htmlContent, correoCliente, nombre);

    await ejecutarSP(SP_GUARDAR_TOKEN_CITA, [correoCliente, token]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: "La pre agenda de la cita fue exitosa",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const cancelarCita = async (req, res, next) => {
  const { idCita, nota, correoCliente, nombreCliente } = req.body;

  try {
    await ejecutarSP(SP_CANCELAR_CITA, [idCita, nota]);

    const nombreEmpresa = "THE KING BARBER";
    const googleCalendarURL = "https://calendar.google.com/calendar/r";

    const titulo = `Tu cita con ${nombreEmpresa} ha sido cancelada`;

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
            <h1 style="color: #333;">¡Hola ${nombreCliente}!</h1>
            <p style="font-size: 16px; color: #555;">Lamentamos informarte que tu cita con <strong>${nombreEmpresa}</strong> ha sido cancelada.</p>
            <p style="font-size: 16px; color: #555;">Motivo de la cancelación: <strong>${
              nota || "No se especificó un motivo."
            }</strong> 
            </p>
            <p style="font-size: 16px; color: #555;">Te invitamos a reprogramar tu cita en otro momento.</p>
            
            <p style="font-size: 16px; color: #555;">Si habías agregado la cita a tu Google Calendar, te recordamos que también deberías cancelarla manualmente accediendo a tu calendario:</p>
            <div style="margin-top: 20px;">
              <a href="${googleCalendarURL}" target="_blank" style="padding: 10px 20px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">Ir a Google Calendar</a>
            </div>
            <p style="font-size: 16px; color: #555; margin-top: 20px;">Por favor, asegúrate de eliminar el evento en tu Google Calendar si ya lo habías añadido.</p>

            <p style="font-size: 16px; color: #333; margin-top: 30px;">Saludos,<br>El equipo de ${nombreEmpresa}</p>
          </div>
        </body>
      </html>
    `;

    await generadorCorreo(titulo, htmlContent, correoCliente, nombreCliente);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Cita cancelada exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const getBitacoraCitas = async (req, res, next) => {
  try {
    const citas = await ejecutarSP(SP_OBTENER_BITACORA_CITAS);

    res.json({
      resultado: citas,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener las bitacoras, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};
