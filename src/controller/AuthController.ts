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
    }
}

export default AuthController;