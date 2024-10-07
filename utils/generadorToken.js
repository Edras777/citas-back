import jwt from "jsonwebtoken";

// utilidad para generar el token para mantener la sesion del usuario
const generateToken = (data, duracion, secret) => {
  return jwt.sign(data, secret, {
    expiresIn: duracion,
  });
};

export default generateToken;
