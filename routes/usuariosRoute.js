import { Router } from "express";
import {
  getProveedoresPorServicio,
  getProveedores,
  getCitas,
  getHorarioLaboral,
  getClientes,
  getUsuarios,
  guardarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  getUsuario,
  actualizarPerfil,
} from "../controllers/usuariosController.js";
import { admin, estaLogueado } from "../middleware/authMiddleware.js";

const usuariosRoute = Router();

usuariosRoute.get("/proveedores/servicio/:id", getProveedoresPorServicio);
usuariosRoute.get("/proveedores", estaLogueado, getProveedores);
usuariosRoute.get("/citas", estaLogueado, getCitas);
usuariosRoute.get("/horarioLaboral", estaLogueado, getHorarioLaboral);
usuariosRoute.get("/clientes", estaLogueado, admin, getClientes);
usuariosRoute.get("/usuarios", estaLogueado, admin, getUsuarios);
usuariosRoute.post("/guardarUsuario", estaLogueado, admin, guardarUsuario);
usuariosRoute.put("/actualizarUsuario", estaLogueado, admin, actualizarUsuario);
usuariosRoute.delete(
  "/eliminarUsuario/:id",
  estaLogueado,
  admin,
  eliminarUsuario
);
usuariosRoute.get("/usuario/", estaLogueado, getUsuario);
usuariosRoute.put("/actualizarPerfil", estaLogueado, actualizarPerfil);

export default usuariosRoute;
