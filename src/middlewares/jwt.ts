import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    // Obtener el token de los headers 'auth' o 'authorization'
    const tokenHeader = req.headers['auth'] || req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const authHeader = tokenHeader as string;

    // Extraer el token (formato: "Bearer TOKEN" o TOKEN directamente)
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

    let jwtPayload;

    try {
        jwtPayload = jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { userId, username } = jwtPayload;

    // Crear nuevo token
    const newToken = jwt.sign({ userId, username }, config.jwtSecret, { expiresIn: '1h' });
    res.setHeader('token', newToken);

    // Llamar al siguiente middleware
    next();
}