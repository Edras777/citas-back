// import mssql from "mssql";
// import { SP_REGISTRAR_USUARIO, SP_LOGIN_USUARIO } from "../utils/sp.js";
// import bcrypt from "bcryptjs";
// import generadorToken from "../utils/generadorToken.js";
// import { signedCookie } from "cookie-parser";
// import { ejecutarSP } from "./data/dbConexion.js";

import { JWT_REFRESH_TOKEN_SECRET, JWT_TOKEN_SECRET } from "../config.js";
import { ejecutarSP } from "../data/dbConexion.js";
import generadorCorreo from "../utils/generadorCorreo.js";
import generadorDeCodigo from "../utils/generadorDeCodigo.js";
import generateToken from "../utils/generadorToken.js";
import generarPassword from "../utils/generarPassword.js";
import {
  SP_AUTENTICAR,
  SP_GUARDAR_TOKEN,
  SP_PRE_AUTENTICAR,
  SP_RECUPERAR_USUARIO,
} from "../utils/sp.js";

import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

export const preAutenticar = async (req, res, next) => {
  const { usuario, password } = req.body;
  try {
    const resultado = await ejecutarSP(SP_PRE_AUTENTICAR, [usuario]);

    if (resultado.length < 1) {
      return res.status(400).json({
        resultado: null,
        ocurrioError: true,
        mensaje: "Usuario o contraseña incorrecto",
      });
    }
    const user = resultado[0];

    const token = generadorDeCodigo();

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    //     // comparar contraseña
    if (!isPasswordCorrect) {
      return res.status(400).json({
        resultado: null,
        ocurrioError: true,
        mensaje: "Usuario o contraseña incorrecto",
      });
    }

    const titulo = `Verificación de inicio de sesión`;
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://scontent-dfw5-2.xx.fbcdn.net/v/t39.30808-6/302075580_591681799070646_3545406768882047780_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=rbd7EIrYOEEQ7kNvgHKnpsk&_nc_ht=scontent-dfw5-2.xx&_nc_gid=Ak6eBvjKhx9YYuLU6wOQIrH&oh=00_AYD9_zvVllLGg6Gm5e2BJDjx6YlRHhq7YrGLl45hhBcLMA&oe=6702C348" alt="THE KING BARBER" style="width: 150px; margin-bottom: 20px;" />
            <h1 style="color: #333;">Hola, ${user.usuario}!</h1>
            <p style="font-size: 16px; color: #555;">Recibimos una solicitud para iniciar sesión en tu cuenta.</p>
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

    await generadorCorreo(titulo, htmlContent, user.email, user.nombre);

    await ejecutarSP(SP_GUARDAR_TOKEN, [user.id, token]);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: "La pre autenticación fue exitosa",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const autenticar = async (req, res, next) => {
  const { usuario, password, token } = req.body;

  try {
    const resultado = await ejecutarSP(SP_AUTENTICAR, [usuario, token]);

    if (resultado.length < 1) {
      return res.status(400).json({
        resultado: null,
        ocurrioError: true,
        mensaje: "El token ingresado es incorrecto",
      });
    }
    const user = resultado[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    //     // comparar contraseña
    if (!isPasswordCorrect) {
      return res.status(400).json({
        resultado: null,
        ocurrioError: true,
        mensaje: "Usuario o contraseña incorrecto",
      });
    }

    const accessToken = generateToken(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.usuario,
        rol: user.tipoRol,
      },
      "15m",
      JWT_TOKEN_SECRET
    );

    const refreshToken = generateToken(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.usuario,
        rol: user.tipoRol,
      },
      "7d",
      JWT_REFRESH_TOKEN_SECRET
    );

    // Almacenar el access token en una cookie HttpOnly
    res.cookie("accessToken", accessToken, {
      httpOnly: false, // Cambiar a true si no deseas que el cliente acceda a la cookie desde JS
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict", // Protege contra ataques CSRF
      maxAge: 15 * 60 * 1000, // 15 minutos (en milisegundos)
      signedCookie: true,
    });

    // Almacenar el refresh token en una cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      signedCookie: true,
    });

    // Enviar el access token como respuesta
    res.json({
      resultado: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.usuario,
        rol: user.tipoRol,
      },
      ocurrioError: false,
      mensaje: "Exito",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: "Sesion cerrada exitosamente",
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta nuevamente o mas tarde"
    );
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
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

    const accessToken = generateToken(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        rol: user.rol,
      },
      "15m",
      JWT_TOKEN_SECRET
    );

    // Almacenar el access token en una cookie HttpOnly
    res.cookie("accessToken", accessToken, {
      httpOnly: false, // Cambiar a true si no deseas que el cliente acceda a la cookie desde JS
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict", // Protege contra ataques CSRF
      maxAge: 15 * 60 * 1000, // 15 minutos (en milisegundos)
      signedCookie: true,
    });

    // Almacenar el refresh token en una cookie HttpOnly
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      signedCookie: true,
    });

    // Enviar el access token como respuesta
    res.json({
      resultado: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        username: user.username,
        rol: user.rol,
      },
      ocurrioError: false,
      mensaje: "Exito",
    });
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

export const recuperarUsuario = async (req, res, next) => {
  try {
    const { correo, usuario } = req.body;

    // Generar una nueva contraseña temporal
    const passwordTextoPlano = generarPassword();
    // Encriptar la contraseña
    // encriptacion de contraseña
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(passwordTextoPlano, salt);

    const resultado = await ejecutarSP(SP_RECUPERAR_USUARIO, [
      correo,
      usuario,
      password,
    ]);

    if (!resultado || resultado.length < 1) {
      res.status(400);
      const error = new Error("Usuario o correo no son correctos");
      return next(error);
    }

    const nombreEmpresa = "THE KING BARBER";

    // Contenido del correo
    const titulo = "Recuperación de Contraseña";
    const htmlContent = `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333; text-align: center;">¡Hola!</h2>
                <p style="color: #555; font-size: 16px; text-align: center;">Hemos recibido una solicitud para restablecer tu contraseña. A continuación, encontrarás tu nueva contraseña temporal:</p>
                
                <p style="background-color: #e3f2fd; color: #0d47a1; padding: 15px; border-radius: 5px; font-size: 18px; text-align: center; font-weight: bold;">
                  ${passwordTextoPlano}
                </p>
                
                <p style="color: #555; font-size: 16px;">Te recomendamos cambiar esta contraseña tan pronto como inicies sesión para asegurar tu cuenta.</p>
                
                <p style="color: #555; font-size: 16px;">Si no solicitaste este cambio, por favor contacta con nosotros de inmediato.</p>
                
                <p style="color: #555; font-size: 16px; text-align: center;">Saludos,</p>
                <p style="color: #333; font-size: 16px; font-weight: bold; text-align: center;">El equipo de ${nombreEmpresa}</p>
                
                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                  Si tienes alguna duda, no dudes en ponerte en contacto con nosotros.
                </p>
              </div>
            </body>
          </html>`;

    await generadorCorreo(titulo, htmlContent, correo, usuario);

    res.json({
      resultado: null,
      ocurrioError: false,
      mensaje: `Se restablecio tu contraseña y se envio un correo electrónico con la información`,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(
      "Ha ocurrido un error, por favor intenta mas tarde"
    );
    next(error);
  }
};
