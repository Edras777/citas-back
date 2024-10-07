import express from "express";
import cors from "cors";
// import authRoute from "./routes/authRoute.js";
import { manejadorError, noEncontrado } from "./middleware/error.js";
import cookieParser from "cookie-parser";
import { HOST_FRONT } from "./config.js";
import serviciosRoute from "./routes/serviciosRoute.js";
import usuariosRoute from "./routes/usuariosRoute.js";
import citasRoute from "./routes/citasRoute.js";
import configRoute from "./routes/configRoute.js";
import authRoute from "./routes/authRoute.js";

// import reportesRoute from "./routes/reportesRoute.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: HOST_FRONT,
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoute);

// servicios
app.use("/api/servicios", serviciosRoute);

// usuarios
app.use("/api/usuarios", usuariosRoute);

// citas
app.use("/api/citas", citasRoute);

// configuraciones
app.use("/api/config", configRoute);

// // manejador de errores
app.use(noEncontrado);
app.use(manejadorError);

export default app;
