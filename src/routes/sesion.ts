import { Router } from "express";
import { SesionController } from "../controller/SesionController";
import { checkJwt } from "../middlewares/jwt";
import { checkRole } from "../middlewares/role";

const router = Router();

router.get("/", [checkJwt, checkRole(["admin"])], SesionController.getAll);

router.get("/:id", [checkJwt, checkRole(["admin"])], SesionController.getById);

router.post("/", [checkJwt, checkRole(["admin"])], SesionController.new);

router.patch("/:id", [checkJwt, checkRole(["admin"])], SesionController.edit);

router.delete(
  "/:id",
  [checkJwt, checkRole(["admin"])],
  SesionController.delete
);

export default router;
