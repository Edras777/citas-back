import { Router } from "express";
import {
  actualizarServicio,
  eliminarServicio,
  getServicios,
  getServiciosCliente,
  getServiciosPorUsuario,
  guardarServicio,
} from "../controllers/serviciosController.js";
import { admin, estaLogueado } from "../middleware/authMiddleware.js";

const serviciosRoute = Router();

serviciosRoute.get("/obtenerServiciosCliente", getServiciosCliente);
serviciosRoute.get("/", estaLogueado, getServicios);
serviciosRoute.get(
  "/obtenerServiciosPorUsuario/:id",
  estaLogueado,
  admin,
  getServiciosPorUsuario
);

serviciosRoute.post("/guardarServicio", estaLogueado, admin, guardarServicio);
serviciosRoute.put(
  "/actualizarServicio",
  estaLogueado,
  admin,
  actualizarServicio
);
serviciosRoute.delete(
  "/eliminarServicio/:id",
  estaLogueado,
  admin,
  eliminarServicio
);

export default serviciosRoute;
