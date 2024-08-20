import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Sesion } from "../entity/Sesion";
import { validate } from "class-validator";

export class SesionController {
  static getAll = async (req: Request, res: Response) => {
    const sesionRepository = AppDataSource.getRepository(Sesion);
    let sesiones: Sesion[];

    try {
      sesiones = await sesionRepository.find();
    } catch (error) {
      return res.status(404).json({ message: "Something goes wrong!" });
    }

    if (sesiones.length > 0) {
      res.send(sesiones);
    } else {
      res.status(404).json({ message: "Not result" });
    }
  };

  static getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sesionRepository = AppDataSource.getRepository(Sesion);

    try {
      const sesion = await sesionRepository.findOneOrFail({
        where: { id: Number(id) },
      });
      res.send(sesion);
    } catch (error) {
      res.status(404).json({ message: "Sesion not found" });
    }
  };

  static new = async (req: Request, res: Response) => {
    const { fechaInicio, fechaFin } = req.body;
    const sesion = new Sesion();

    // Convertir a instancias de Date
    sesion.fechaInicio = new Date(fechaInicio);
    sesion.fechaFin = fechaFin ? new Date(fechaFin) : undefined;

    // Opciones de validación
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(sesion, validationOpt);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    const sesionRepository = AppDataSource.getRepository(Sesion);
    try {
      await sesionRepository.save(sesion);
    } catch (error) {
      return res.status(409).json({ message: "Sesion creation failed" });
    }

    return res.status(201).json({ message: "Sesion created successfully" });
  };

  static edit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fechaInicio, fechaFin } = req.body;

    const sesionRepository = AppDataSource.getRepository(Sesion);
    let sesion: Sesion;

    try {
      sesion = await sesionRepository.findOneOrFail({
        where: { id: Number(id) },
      });
      sesion.fechaInicio = fechaInicio;
      sesion.fechaFin = fechaFin;
    } catch (error) {
      return res.status(404).json({ message: "Sesion not found" });
    }

    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(sesion, validationOpt);

    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    try {
      await sesionRepository.save(sesion);
    } catch (error) {
      return res.status(409).json({ message: "Sesion update failed" });
    }

    res.status(201).json({ message: "Sesion updated" });
  };

  static delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const sesionRepository = AppDataSource.getRepository(Sesion);

    let sesion: Sesion;

    try {
      sesion = await sesionRepository.findOneOrFail({
        where: { id: Number(id) },
      });
    } catch (error) {
      return res.status(404).json({ message: "Sesion not found" });
    }

    await sesionRepository.delete(id);
    res.status(201).json({ message: "Sesion deleted" });
  };
}

export default SesionController;
