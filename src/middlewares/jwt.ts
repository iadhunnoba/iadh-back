import { Request, Response, NextFunction } from "express";

import * as jwt from "jsonwebtoken";
import config from "../config/config"

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    //console.log('Req--', req.headers)
    const token = <string>req.headers['auth'];

    let jwtPayload;

    try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).json({ message: 'Not Authorized' });
    }

    const { userId, username } = jwtPayload;

    // Creo el token
    const newToken = jwt.sign({ userId, username }, config.jwtSecret, { expiresIn: '1h' });
    res.setHeader('token', newToken);

    // Call next
    next();
}
