import { config } from "dotenv";

config();

// PUERTO
export const PORT = process.env.PORT ?? 3000;

// SECRETO PARA JSONWEBTOKEN
export const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
export const JWT_REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;

// CREDENCIALES PARA MYSQL
export const USER = process.env.USER;
export const PASS = process.env.PASS;
export const SERVER = process.env.SERVER;
export const DB = process.env.DB;

export const HOST_FRONT = process.env.HOST_FRONT ?? "http://localhost:5173";

// api brevo para correo
export const API_KEY_BREVO = process.env.API_KEY_BREVO;
