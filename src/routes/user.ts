
import { Router } from "express"
import { UserController } from "../controller/UserController";
import { checkJwt } from "../middlewares/jwt";
import { checkRole } from "../middlewares/role";

const router = Router();

// Lo que marca el comportamiento de la api es el verbo que utilizo (get, post, patch, delete)

// [checkJwt] valida el token
// [checkRole] valida el rol del usuario

// Get all users
router.get('/', [checkJwt, checkRole(['admin'])], UserController.getAll);

// Get one user
router.get('/:id', [checkJwt, checkRole(['admin'])], UserController.getById);

// Create new user
router.post('/', [checkJwt, checkRole(['admin'])], UserController.new);

// Edit user or update user
router.patch('/:id', [checkJwt, checkRole(['admin'])], UserController.edit);

// Delete user
router.delete('/:id', [checkJwt, checkRole(['admin'])], UserController.delete);

export default router;