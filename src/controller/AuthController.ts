//import { getRepository } from "typeorm"; No funciona, porque esta desactualizado 
import { AppDataSource } from "../data-source"
import { Request, Response } from "express";
import { User } from "../entity/User"

import * as jwt from "jsonwebtoken";
import config from "../config/config"
import { validate } from "class-validator";

class AuthController {
    static login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validación de campos
    if (!username || !password) {
      return res.status(400).json({ message: "Username and Password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);

    // Buscar usuario
    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Username or password incorrect!" });
    }

    // Verificar password
    const isValidPassword = user.checkPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Username or password incorrect!" });
    }

    // Crear token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    // Datos de respuesta
    const userInfo = {
      id: user.id,
      username: user.username,
      role: (user as any).role ?? null,
    };

    return res.status(200).json({
      message: "Ok",
      userInfo,
      token,
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

    static changePassword = async (req: Request, res: Response) => {
        const { id } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;

        if (!(oldPassword && newPassword)) {
            return res.status(400).json({ message: 'Old password & new password are required' });
        }

        const userRepository = AppDataSource.getRepository(User);

        let user: User;

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(400).json({ message: 'Somenthing goes wrong!' });
        }

        if (!user.checkPassword(oldPassword)) {
            return res.status(401).json({ message: 'Check your old Password' });
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