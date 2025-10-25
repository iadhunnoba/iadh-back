// Importo desde express Router
import { Router } from "express";

import AuthController from "../controller/AuthController";
import { checkJwt } from "../middlewares/jwt";

const router = Router();

// Login
router.post("/login", AuthController.login);

// Register
router.post("/register", AuthController.register);

// Change password
router.post("/change-password", [checkJwt], AuthController.changePassword);

export default router;
