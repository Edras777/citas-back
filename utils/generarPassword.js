import crypto from "node:crypto";

// Función para generar una contraseña aleatoria
export default function generarPassword(length = 8) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}
