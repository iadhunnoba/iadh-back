import { Request, Response, NextFunction } from 'express'
import { User } from '../entity/User'
import { AppDataSource } from '../data-source';

export const checkRole = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { id } = res.locals.jwtPayload;
        const userRepository = AppDataSource.getRepository(User)

        let user: User;

        try {
            user = await userRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(401).json({ message: 'Not Authorized' });
        }

        // Check
        const { role } = user;
        if (roles.includes(role)) {
            next();
        } else {
            res.status(401).json({ message: 'Not Authorized' });
        }

    }
}