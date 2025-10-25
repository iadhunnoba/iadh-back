import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Obtener el token de la cabecera "Authorization"
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  // El token se envía en el formato "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not Authorized" });
  }

  let jwtPayload;
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    console.error("Error during verification:", error);
    return res.status(401).json({ message: "Not Authorized" });
  }

  const { userId, username } = jwtPayload;

  // Crear un nuevo token
  const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    expiresIn: "1h",
  });
  res.setHeader("token", newToken);

  // Continuar con el siguiente middleware
  next();
};
