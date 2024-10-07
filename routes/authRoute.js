import { Router } from "express";
import {
  autenticar,
  logout,
  preAutenticar,
  recuperarUsuario,
  refreshToken,
} from "../controllers/authController.js";

const authRoute = Router();

authRoute.post("/preAutenticar", preAutenticar);
authRoute.post("/autenticar", autenticar);
authRoute.get("/logout", logout);
authRoute.get("/refreshToken", refreshToken);
authRoute.post("/recuperarUsuario", recuperarUsuario);

export default authRoute;
