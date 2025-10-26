// Importo desde express Router
import { Router } from 'express';
import sessionRoutes from './sessionRoutes';

// Importo los modulos que necesito
import auth from './auth';
import user from './user';

const routes = Router();

routes.use('/auth', auth);

routes.use('/users', user);

routes.use('/', sessionRoutes);
// Para que el usuario puede loguearse debera acceder al host
// localhost:3000/auth/login
// Para las otras acciones localhost:3000/users (endpoint)

export default routes;
