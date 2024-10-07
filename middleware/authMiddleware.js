import jwt from "jsonwebtoken";

import { JWT_REFRESH_TOKEN_SECRET } from "../config.js";
import { ejecutarSP } from "../data/dbConexion.js";
import { SP_PRE_AUTENTICAR } from "../utils/sp.js";

// // middleware que me permite verificar que el usuario este logueado
export const estaLogueado = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies; // Obtener el refresh token de las cookies

    if (!refreshToken) {
      res.status(401);
      const error = new Error("No existe el token");
      return next(error);
    }

    const user = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET);

    if (!user) {
      res.status(401);
      const error = new Error("El token es invalido");
      return next(error);
    }

    const resultado = await ejecutarSP(SP_PRE_AUTENTICAR, [user.username]);

    if (resultado.length < 1) {
      res.status(401);
      const error = new Error("El token es invalido");
      return next(error);
    }

    req.usuario = user;
    next();
  } catch (err) {
    console.log(err);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // Manejar errores específicos de JWT
    if (err.name === "TokenExpiredError") {
      res.status(401);
      const error = new Error("El token ha expirado");
      return next(error);
    }
    if (err.name === "JsonWebTokenError") {
      res.status(401);
      const error = new Error("Token no válido");
      return next(error);
    }

    const error = new Error(
      "Ha ocurrido un error, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

// // // middleware que me permite verificar que el usuario es admin
export const admin = (req, res, next) => {
  const usuario = req.usuario;
  if (usuario.rol && usuario.rol === "ADMIN") {
    next();
  } else {
    res.status(401);
    const error = new Error("Solo personal autorizado");
    return next(error);
  }
};
