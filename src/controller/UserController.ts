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
            return res.status(404).json({ message: 'Something goes wrong!' });
        }

        if (users.length > 0) {
            res.send(users);
        } else {
            res.status(404).json({ message: 'Not result' });
        }
    }

    static getStudents = async (req: Request, res: Response) => {
        const userRepository = AppDataSource.getRepository(User);

        try {
            // Obtener parámetros de query
            const { 
                search, 
                name, 
                surname, 
                email, 
                studentIdNumber,
                page = '1', 
                limit = '10' 
            } = req.query;

            // Convertir a números
            const pageNumber = parseInt(page as string);
            const limitNumber = parseInt(limit as string);
            const skip = (pageNumber - 1) * limitNumber;

            // Construir query
            const queryBuilder = userRepository
                .createQueryBuilder("user")
                .where("user.role = :role", { role: "user" })
                .select([
                    'user.id',
                    'user.username',
                    'user.name',
                    'user.surname',
                    'user.studentIdNumber',
                    'user.license',
                    'user.createdAt',
                    'user.updatedAt'
                ]);

            // Aplicar filtros
            if (search) {
                queryBuilder.andWhere(
                    "(user.name LIKE :search OR user.surname LIKE :search OR user.username LIKE :search OR user.studentIdNumber LIKE :search)",
                    { search: `%${search}%` }
                );
            }

            if (name) {
                queryBuilder.andWhere("user.name LIKE :name", { name: `%${name}%` });
            }

            if (surname) {
                queryBuilder.andWhere("user.surname LIKE :surname", { surname: `%${surname}%` });
            }

            if (email) {
                queryBuilder.andWhere("user.username LIKE :email", { email: `%${email}%` });
            }

            if (studentIdNumber) {
                queryBuilder.andWhere("user.studentIdNumber LIKE :studentIdNumber", { 
                    studentIdNumber: `%${studentIdNumber}%` 
                });
            }

            // Obtener total antes de aplicar paginación
            const total = await queryBuilder.getCount();

            // Aplicar paginación
            const students = await queryBuilder
                .skip(skip)
                .take(limitNumber)
                .orderBy('user.surname', 'ASC')
                .addOrderBy('user.name', 'ASC')
                .getMany();

            // Calcular información de paginación
            const totalPages = Math.ceil(total / limitNumber);

            return res.json({
                data: students,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1
                }
            });

        } catch (error) {
            console.error('Error in getStudents:', error);
            return res.status(500).json({ message: "Something went wrong!" });
        }
    }

    static getById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const userRepository = AppDataSource.getRepository(User);

        try {
            const user = await userRepository.findOneOrFail({ where: { id } });
            res.send(user);
        } catch (error) {
            res.status(404).json({ message: 'Not result' });
        }
    }

    static new = async (req: Request, res: Response) => {
        const { username, password, role, name, surname, license, studentIdNumber } = req.body;
        const user = new User();

        user.username = username;
        user.password = password;
        user.role = role;
        user.name = name;
        user.surname = surname;
        user.license = license || '';
        user.studentIdNumber = studentIdNumber || '';

        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors)
        }

        const userRepository = AppDataSource.getRepository(User);
        try {
            user.hashPassword();
            await userRepository.save(user);
        } catch (error) {
            return res.status(409).json({ message: 'Error create user' })
        }

        res.send('User created')
    }

    static edit = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { username, role, name, surname, license, studentIdNumber } = req.body;

        let user: User;

        const userRepository = AppDataSource.getRepository(User);

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
            user.username = username;
            user.role = role;
            if (name) user.name = name;
            if (surname) user.surname = surname;
            if (license !== undefined) user.license = license;
            if (studentIdNumber !== undefined) user.studentIdNumber = studentIdNumber;
        } catch (error) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validationOpt = { validationError: { target: false, value: false } };
        const errors = await validate(user, validationOpt);

        if (errors.length > 0) {
            return res.status(400).json(errors)
        }

        try {
            await userRepository.save(user);
        } catch (error) {
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

        userRepository.delete(id);
        res.status(201).json({ message: 'User deleted' });
    }
}

export default UserController;