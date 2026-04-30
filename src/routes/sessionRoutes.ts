import { Router } from "express";
import RcpSessionController from "../controller/RcpSessionController";
import { checkJwt } from "../middlewares/jwt";
import { checkRole } from "../middlewares/role";

const router = Router();

// Iniciar sesión RCP
router.post(
  "/students/:id/rcp-sessions/start",
  [checkJwt, checkRole(["admin", "profesor", "estudiante"])],
  RcpSessionController.startSession
);

// Finalizar sesión RCP (acepta array de eventos en el body)
router.post(
  "/students/:id/rcp-sessions/:sessionId/end",
  [checkJwt, checkRole(["admin", "profesor", "estudiante"])],
  RcpSessionController.endSession
);

// Obtener una sesión RCP específica con sus eventos
router.get(
  "/students/:id/rcp-sessions/:sessionId",
  [checkJwt, checkRole(["admin", "profesor", "estudiante"])],
  RcpSessionController.getSessionById
);

// Editar observaciones generales y por evento de una sesión (solo docente/admin)
router.patch(
  "/students/:id/rcp-sessions/:sessionId",
  [checkJwt, checkRole(["admin", "profesor"])],
  RcpSessionController.updateSessionObservations
);

// Obtener historial de sesiones RCP
router.get(
  "/students/:id/rcp-sessions",
  [checkJwt, checkRole(["admin", "profesor", "estudiante"])],
  RcpSessionController.getStudentSessions
);

export default router;
