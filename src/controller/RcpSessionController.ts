import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { RcpSession } from "../entity/RcpSession";
import { User } from "../entity/User";
import { validate } from "class-validator";

export class RcpSessionController {
  // POST /students/:id/rcp-sessions/start
  // Inicia una nueva sesión RCP para un estudiante
  static startSession = async (req: Request, res: Response) => {
    const { id } = req.params; // ID del estudiante
    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    // Verificar si el usuario existe y es un estudiante (rol "user")
    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "user" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Crear una nueva sesión RCP
    const rcpSession = new RcpSession();
    rcpSession.student = student;
    rcpSession.startedAt = new Date();

    // Validar la entidad
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(rcpSession, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Guardar la sesión
    try {
      await rcpSessionRepository.save(rcpSession);
      return res.status(201).json({
        message: "RCP session started",
        session: {
          id: rcpSession.id,
          studentId: rcpSession.student.id,
          startedAt: rcpSession.startedAt,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to start RCP session" });
    }
  };

  // POST /students/:id/rcp-sessions/:sessionId/end
  // Cierra una sesión RCP existente
  static endSession = async (req: Request, res: Response) => {
    const { id, sessionId } = req.params; // id: estudiante, sessionId: sesión RCP
    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    // Verificar si el usuario existe y es un estudiante
    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "user" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verificar si la sesión existe y pertenece al estudiante
    let rcpSession: RcpSession;
    try {
      rcpSession = await rcpSessionRepository.findOneOrFail({
        where: { id: Number(sessionId), student: { id: String(id) } },
        relations: ["student"],
      });
    } catch (error) {
      return res.status(404).json({ message: "RCP session not found" });
    }

    // Verificar si la sesión ya está cerrada
    if (rcpSession.endedAt) {
      return res.status(400).json({ message: "RCP session already ended" });
    }

    // Actualizar la sesión con la fecha de finalización y calcular duración
    rcpSession.endedAt = new Date();
    rcpSession.calculateDuration();

    // Validar la entidad actualizada
    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(rcpSession, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    // Guardar los cambios
    try {
      await rcpSessionRepository.save(rcpSession);
      return res.status(200).json({
        message: "RCP session ended",
        session: {
          id: rcpSession.id,
          studentId: rcpSession.student.id,
          startedAt: rcpSession.startedAt,
          endedAt: rcpSession.endedAt,
          duration: rcpSession.duration,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to end RCP session" });
    }
  };


  // GET /students/:id/rcp-sessions
  // Retrieves the history of RCP sessions for a specific student with pagination and optional filters
  static getStudentSessions = async (req: Request, res: Response) => {
    const { id } = req.params; // Student ID
    const { page = '1', limit = '10', startDate, endDate, isCompleted } = req.query;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    // Validate student existence and role
    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "user" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Convert query parameters
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ message: "Invalid page or limit parameters" });
    }

    // Build query
    const queryBuilder = rcpSessionRepository
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.student", "student")
      .where("session.student = :studentId", { studentId: Number(id) })
      .select([
        "session.id",
        "session.startedAt",
        "session.endedAt",
        "session.duration",
        "session.observation",
        "session.createdAt",
        "student.id",
        "student.username",
        "student.name",
        "student.surname",
      ]);

    // Apply filters
    if (startDate) {
      try {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: "Invalid startDate format" });
        }
        queryBuilder.andWhere("session.startedAt >= :startDate", { startDate: start });
      } catch (error) {
        return res.status(400).json({ message: "Invalid startDate format" });
      }
    }

    if (endDate) {
      try {
        const end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: "Invalid endDate format" });
        }
        queryBuilder.andWhere("session.startedAt <= :endDate", { endDate: end });
      } catch (error) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }

    if (isCompleted !== undefined) {
      const isCompletedBool = isCompleted === "true";
      queryBuilder.andWhere(
        isCompletedBool ? "session.endedAt IS NOT NULL" : "session.endedAt IS NULL"
      );
    }

    try {
      // Get total count before pagination
      const total = await queryBuilder.getCount();

      // Apply pagination and sorting
      const sessions = await queryBuilder
        .orderBy("session.startedAt", "DESC")
        .skip(skip)
        .take(limitNumber)
        .getMany();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limitNumber);

      return res.status(200).json({
        data: sessions,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPreviousPage: pageNumber > 1,
        },
      });
    } catch (error) {
      console.error("Error in getStudentSessions:", error);
      return res.status(500).json({ message: "Something went wrong!" });
    }

    };

}

export default RcpSessionController;