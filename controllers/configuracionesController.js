import { SP_GUARDAR_HORARIO_LABORAL, SP_HORARIO_LABORAL } from "../utils/sp.js";
import { ejecutarSP } from "../data/dbConexion.js";

export const getHorarioLaboral = async (req, res, next) => {
  try {
    const horario = await ejecutarSP(SP_HORARIO_LABORAL);

    res.json({
      resultado: JSON.parse(horario[0]?.valor),
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error("Error interno del servidor");
    next(error);
  }
};

export const guardarHorarioLaboral = async (req, res, next) => {
  try {
    let { horarioLaboral } = req.body;

    horarioLaboral = JSON.stringify(horarioLaboral);

    await ejecutarSP(SP_GUARDAR_HORARIO_LABORAL, [horarioLaboral]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Horario laboral guardando exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};
