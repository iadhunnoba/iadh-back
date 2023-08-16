import { AppDataSource } from "../data-source"
import { Request, Response } from "express"
import { User } from "../entity/User"
import { validate } from "class-validator"

export class UserController {
    static getAll = async (req: Request, res: Response) => {
        const userRepository = AppDataSource.getRepository(User);
        let users: User[];

        try {
            users = await userRepository.find();
        } catch (error) {
            res.status(404).json({ message: 'Something goes wrong!' });
        }

        if (users.length > 0) {
            res.send(users);
        } else {
            res.status(404).json({ message: 'Not result' });
        }
    }

    static getById = async (req: Request, res: Response) => {
        // Capturamos el id que viene del Front-end en los parametros de la URL 
        const { id } = req.params;
        const userRepository = AppDataSource.getRepository(User);

        try {
            // findOneOrFail(id); fue eliminada y la sintaxis ha cambiado
            // Sintaxis actual
            const user = await userRepository.findOneOrFail({ where: { id } });
            res.send(user);
        } catch (error) {
            res.status(404).json({ message: 'Not result' });
        }

    }

    static new = async (req: Request, res: Response) => {
        // Capturamos lo que viene del Front-end
        const { username, password, role } = req.body;
        const user = new User();

        user.username = username;
        user.password = password;
        user.role = role;

        // Validate (Se encargara de complir con las reglas que definimos)
        // Opciones de validación
        // Oculto la informacion innecesaria del error
        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors)
        }

        // TO DO (HAY QUE HACER) : HASH PASSWORD

        const userRepository = AppDataSource.getRepository(User);
        try {
            // HASH PASSWORD
            user.hashPassword();
            await userRepository.save(user);
        } catch (error) {
            return res.status(409).json({ message: 'Username already exist' })
        }

        // Si todo sale bien...
        res.send('User created')

    }

    static edit = async (req: Request, res: Response) => {
        // Capturamos lo que viene del Front-end
        const { id } = req.params;
        const { username, role } = req.body; // No obtengo la password por que esta no se podria editar desde aqui.

        let user: User;

        const userRepository = AppDataSource.getRepository(User);

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
            user.username = username;
            user.role = role;
        } catch (error) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Opciones de validación
        // Oculto la informacion innecesaria del error
        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors)
        }

        // Try to save user
        try {
            await userRepository.save(user);
        } catch (error) {
            // EL usuario existe en la base de datos
            return res.status(409).json({ message: 'Username already in use' });
        }

        res.status(201).json({ message: 'User update' });
    }

    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRepository = AppDataSource.getRepository(User);

        let user: User;

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove user
        userRepository.delete(id);
        res.status(201).json({ message: 'User deleted' });
    }
}

export default UserController;