import { Router } from "express";
import {
  getHorarioLaboral,
  guardarHorarioLaboral,
} from "../controllers/configuracionesController.js";

import { admin, estaLogueado } from "../middleware/authMiddleware.js";

const configRoute = Router();

configRoute.get("/horarioLaboral", estaLogueado, admin, getHorarioLaboral);

configRoute.put(
  "/guardarHorarioLaboral",
  estaLogueado,
  admin,
  guardarHorarioLaboral
);

export default configRoute;
