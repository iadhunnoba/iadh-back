//import { getRepository } from "typeorm"; No funciona, porque esta desactualizado 
import { AppDataSource } from "../data-source"
import { Request, Response } from "express";
import { User } from "../entity/User"

import * as jwt from "jsonwebtoken";
import config from "../config/config"
import { validate } from "class-validator";

class AuthController {
    static login = async (req: Request, res: Response) => {
        // Capturamos lo que viene del Front-end
        const { username, password } = req.body;

        if (!(username && password)) {
            return res.status(400).json({ message: 'Username and Password are required' });
        }

        const userRepository = AppDataSource.getRepository(User)
        let user: User;

        // Pregunto si el usario pertenece a la base de datos con el campo username con el username enviado del Front-end
        try {
            user = await userRepository.findOneOrFail({ where: { username } });
        } catch (error) {
            return res.status(400).json({ message: 'Username or password incorrect!' });
        }

        // Check password
        if (!user.checkPassword(password)) {
            return res.status(400).json({ message: 'Username or password incorrect!' });
        }

        // Creo el token
        const token = jwt.sign({ userId: user.id, username: user.username }, config.jwtSecret, { expiresIn: '1h' });

        // Si todo sale bien ...
        res.send({ message: 'Ok', token });
    }

    static changePassword = async (req: Request, res: Response) => {
        const { id } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;

        if (!(oldPassword && newPassword)) {
            res.status(400).json({ message: 'Old password & new password are required' });
        }

        const userRepository = AppDataSource.getRepository(User);

        let user: User;

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            res.status(400).json({ message: 'Somenthing goes wrong!' });
        }

        if (!user.checkPassword(oldPassword)) {
            res.status(401).json({ message: 'Check your old Password' });
        }

        user.password = newPassword;

        // Opciones de validación
        // Oculto la informacion innecesaria del error
        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        // HASH PASSWORD
        user.hashPassword();
        userRepository.save(user);

        res.json({ message: 'Password change!' });
    }
}

export default AuthController;