import {
  SP_ACTUALIZAR_SERVICIO,
  SP_ELIMINAR_SERVICIO,
  SP_GUARDAR_SERVICIO,
  SP_OBTENER_SERVICIOS,
  SP_OBTENER_SERVICIOS_CLIENTE,
  SP_OBTENER_SERVICIOS_POR_USUARIO,
} from "../utils/sp.js";
import { ejecutarSP } from "../data/dbConexion.js";

export const getServiciosCliente = async (req, res, next) => {
  try {
    const servicios = await ejecutarSP(SP_OBTENER_SERVICIOS_CLIENTE);

    res.json({
      resultado: servicios,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener los servicios, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const getServicios = async (req, res, next) => {
  try {
    const servicios = await ejecutarSP(SP_OBTENER_SERVICIOS);

    res.json({
      resultado: servicios,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener los servicios, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const guardarServicio = async (req, res, next) => {
  try {
    const { nombre, precio, duracion, privado, descripcion } = req.body;

    await ejecutarSP(SP_GUARDAR_SERVICIO, [
      nombre,
      precio,
      duracion,
      privado,
      descripcion,
    ]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Servicio creado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const actualizarServicio = async (req, res, next) => {
  try {
    const { idServicio, nombre, precio, duracion, privado, descripcion } =
      req.body;

    await ejecutarSP(SP_ACTUALIZAR_SERVICIO, [
      idServicio,
      nombre,
      precio,
      duracion,
      privado,
      descripcion,
    ]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Servicio actualizado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    await ejecutarSP(SP_ELIMINAR_SERVICIO, [id]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Servicio eliminado exitosamente`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};

export const getServiciosPorUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const servicios = await ejecutarSP(SP_OBTENER_SERVICIOS_POR_USUARIO, [id]);

    res.json({
      resultado: servicios,
      ocurrioError: false,
      mensaje: "exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error al obtener los servicios, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};
