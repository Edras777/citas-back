import { Router } from "express";

import {
  cancelarCita,
  getCitasReservadasProveedor,
  getdiasNoLaborales,
  getHorarioDisponiblePorFecha,
  guardarCita,
  preGuardarCitaCliente,
  guardarCitaCliente,
  getBitacoraCitas,
} from "../controllers/citasController.js";

import { admin, estaLogueado } from "../middleware/authMiddleware.js";

const citasRoute = Router();

citasRoute.get("/proveedor/:id", getCitasReservadasProveedor);
citasRoute.get("/diasNoLaborales", getdiasNoLaborales);
citasRoute.get("/horarioDisponible", getHorarioDisponiblePorFecha);
citasRoute.post("/preguardarCitaCliente", preGuardarCitaCliente);
citasRoute.post("/guardarCitaCliente", guardarCitaCliente);

citasRoute.post("/guardarCita", estaLogueado, admin, guardarCita);
citasRoute.post("/cancelarCita", estaLogueado, admin, cancelarCita);

citasRoute.get("/obtenerBitacoraCitas", estaLogueado, admin, getBitacoraCitas);

export default citasRoute;
