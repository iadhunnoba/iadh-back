<<<<<<< HEAD
import { AppDataSource } from "../data-source"
import { Request, Response } from "express";
import { User } from "../entity/User"
=======
//import { getRepository } from "typeorm"; No funciona, porque esta desactualizado
import { AppDataSource } from "../data-source";
import { Request, Response } from "express";
import { User } from "../entity/User";

>>>>>>> devElias
import * as jwt from "jsonwebtoken";
import config from "../config/config";
import { validate } from "class-validator";

class AuthController {
<<<<<<< HEAD
    static login = async (req: Request, res: Response) => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ message: "Username and Password are required" });
            }

            const userRepository = AppDataSource.getRepository(User);

            // Buscar usuario e incluir explícitamente el password
            const user = await userRepository.findOne({ 
                where: { username },
                select: ['id', 'username', 'password', 'role', 'name', 'surname'] 
            });
            
            if (!user) {
                return res.status(401).json({ message: "Username or password incorrect!" });
            }

            const isValidPassword = user.checkPassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ message: "Username or password incorrect!" });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role }, 
                config.jwtSecret,
                { expiresIn: "1h" }
            );

            const userInfo = {
                id: user.id,
                username: user.username,
                role: user.role,
                name: user.name,
                surname: user.surname
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
        const { userId } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;

        if (!(oldPassword && newPassword)) {
            return res.status(400).json({ message: 'Old password & new password are required' });
        }

        const userRepository = AppDataSource.getRepository(User);

        let user: User;

        try {
            // Incluir explícitamente el password para poder validarlo
            user = await userRepository.findOneOrFail({ 
                where: { id: userId },
                select: ['id', 'username', 'password', 'role']
            });
        } catch (error) {
            return res.status(400).json({ message: 'Something goes wrong!' });
        }

        if (!user.checkPassword(oldPassword)) {
            return res.status(401).json({ message: 'Check your old Password' });
        }

        user.password = newPassword;

        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors);
        }

        user.hashPassword();
        await userRepository.save(user);

        res.json({ message: 'Password changed!' });
=======
  static login = async (req: Request, res: Response) => {
    // Capturamos lo que viene del Front-end
    const { username, password } = req.body;

    if (!(username && password)) {
      return res
        .status(400)
        .json({ message: "Username and Password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    let user: User;

    // Pregunto si el usario pertenece a la base de datos con el campo username con el username enviado del Front-end
    try {
      user = await userRepository.findOneOrFail({ where: { username } });
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Username or password incorrect!" });
>>>>>>> devElias
    }

    // Check password
    if (!user.checkPassword(password)) {
      return res
        .status(400)
        .json({ message: "Username or password incorrect!" });
    }

    // Creo el token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    // Si todo sale bien ...
    res.send({ message: "Ok", token });
  };

  static changePassword = async (req: Request, res: Response) => {
    const { id } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
      res
        .status(400)
        .json({ message: "Old password & new password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);

    let user: User;

    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(400).json({ message: "Somenthing goes wrong!" });
    }

    if (!user.checkPassword(oldPassword)) {
      res.status(401).json({ message: "Check your old Password" });
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

    res.json({ message: "Password change!" });
  };

  static register = async (req: Request, res: Response) => {
    const { username, role, password } = req.body;

    if (!(username && role && password)) {
      return res
        .status(400)
        .json({ message: "Username, role, and password are required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    let user = new User();
    user.username = username;
    user.role = role;
    user.password = password;

    // Validación de la entidad User
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(user, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Verificar si el usuario ya existe
    try {
      const existingUser = await userRepository.findOne({
        where: [{ username }],
      });
      if (existingUser) {
        return res.status(409).json({ message: "Username already in use" });
      }
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    // Hash password
    user.hashPassword();

    // Guardar el nuevo usuario en la base de datos
    try {
      await userRepository.save(user);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }

    // Retornar el token de autenticación
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User created", token });
  };
}

export default AuthController;
