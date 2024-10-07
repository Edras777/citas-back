import crypto from "node:crypto";

export default function generateConfirmationCode() {
  return crypto.randomBytes(3).toString("hex"); // Genera un código alfanumérico de 6 caracteres
}
