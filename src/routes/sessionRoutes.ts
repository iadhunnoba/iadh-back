import { Router } from "express";
import RcpSessionController from "../controller/RcpSessionController";
import { checkJwt } from "../middlewares/jwt";
import { checkRole } from "../middlewares/role";

const router = Router();

// Rutas para sesiones RCP
// Iniciar sesión RCP
router.post(
  "/students/:id/rcp-sessions/start", 
  [checkJwt, checkRole(['admin', 'profesor', 'estudiante'])], 
  RcpSessionController.startSession
);

// Finalizar sesión RCP
router.post(
  "/students/:id/rcp-sessions/:sessionId/end", 
  [checkJwt, checkRole(['admin', 'profesor', 'estudiante'])], 
  RcpSessionController.endSession
);

// Obtener historial de sesiones RCP
router.get(
  "/students/:id/rcp-sessions", 
  [checkJwt, checkRole(['admin', 'profesor', 'estudiante'])], 
  RcpSessionController.getStudentSessions
);

export default router;