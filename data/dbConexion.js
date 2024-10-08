import mysql from "mysql2/promise";

import { DB, PASS, PORT_DB, SERVER, USER } from "../config.js";

const conexionMySql = async () => {
  // Conexion a mysql
  let connection = null;
  try {
    connection = await mysql.createConnection({
      host: SERVER,
      user: USER,
      database: DB,
      port: PORT_DB,
      password: PASS,
    });

    console.log("CONEXION EXITOSA DB");
  } catch (err) {
    console.log("error de db ", err);
  }

  return connection;
};

export const ejecutarSP = async (sp, parametros = []) => {
  const conection = await conexionMySql();

  if (!conection) throw Error("Error en la conexion de la db");

  try {
    let query = `CALL ${sp}(`;

    for (let i = 0; i < parametros.length; i++) {
      query +=
        parametros.length > 1 && parametros.length - 1 !== i ? `?,` : `?`;
    }

    query += `)`;

    const [rows, fields] = await conection.execute(query, parametros);

    await conection.end();
    return rows[0];
  } catch (error) {
    await conection.end();
    throw new Error(`error al ejecutar el sp ${sp}, ${error}`);
  }
};
