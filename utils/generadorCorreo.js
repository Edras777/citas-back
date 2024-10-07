import brevo from "@getbrevo/brevo";
import { API_KEY_BREVO } from "../config.js";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default async function generadorCorreo(
  titulo,
  htmlContent,
  email,
  name
) {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      API_KEY_BREVO
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = titulo;

    sendSmtpEmail.to = [
      {
        email,
        name,
      },
    ];

    sendSmtpEmail.htmlContent = htmlContent;

    sendSmtpEmail.sender = {
      name: "THE KING BARBER",
      email: "cregalo94@gmail.com",
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.log(error);
    throw new Error(`error al enviar el email: ${error.message}`);
  }
}
