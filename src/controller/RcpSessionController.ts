import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { RcpSession } from "../entity/RcpSession";
import { SessionEvent } from "../entity/SessionEvent";
import { User } from "../entity/User";
import { validate } from "class-validator";

export class RcpSessionController {
  // POST /students/:id/rcp-sessions/start
  static startSession = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startedAt } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "estudiante" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    const rcpSession = new RcpSession();
    rcpSession.student = student;
    rcpSession.startedAt = startedAt ? new Date(startedAt) : new Date();

    const validationOpt = { validationError: { target: false, value: false } };
    const errors = await validate(rcpSession, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

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
  static endSession = async (req: Request, res: Response) => {
    const { id, sessionId } = req.params;
    const {
      avgPulmonaryPressure,
      avgVentilation,
      avgCorrectPosition,
      observation,
      endedAt,
      duration,
      events, // Array de eventos de la sesión
    } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);
    const sessionEventRepository = AppDataSource.getRepository(SessionEvent);

    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "estudiante" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    let rcpSession: RcpSession;
    try {
      rcpSession = await rcpSessionRepository.findOneOrFail({
        where: { id: Number(sessionId), student: { id: String(id) } },
        relations: ["student"],
      });
    } catch (error) {
      return res.status(404).json({ message: "RCP session not found" });
    }

    if (rcpSession.endedAt) {
      return res.status(400).json({ message: "RCP session already ended" });
    }

    rcpSession.endedAt = endedAt ? new Date(endedAt) : new Date();

    if (duration !== undefined) {
      rcpSession.duration = duration;
    } else {
      rcpSession.calculateDuration();
    }

    if (avgPulmonaryPressure !== undefined)
      rcpSession.avgPulmonaryPressure = avgPulmonaryPressure;
    if (avgVentilation !== undefined)
      rcpSession.avgVentilation = avgVentilation;
    if (avgCorrectPosition !== undefined)
      rcpSession.avgCorrectPosition = avgCorrectPosition;
    if (observation !== undefined) rcpSession.observation = observation;

    const validationOpt = {
      validationError: { target: false, value: false },
      skipMissingProperties: true,
    };
    const errors = await validate(rcpSession, validationOpt);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    try {
      await rcpSessionRepository.save(rcpSession);

      // Guardar los eventos de la sesión si se enviaron
      if (events && Array.isArray(events) && events.length > 0) {
        const sessionEvents = events.map((evt: any) => {
          const sessionEvent = new SessionEvent();
          sessionEvent.session = rcpSession;
          sessionEvent.eventType = evt.eventType || "UNKNOWN";
          sessionEvent.eventData = evt.eventData || null;
          sessionEvent.observation = evt.observation || null;
          sessionEvent.sessionTimeSeconds = evt.sessionTimeSeconds || 0;
          return sessionEvent;
        });
        await sessionEventRepository.save(sessionEvents);
      }

      return res.status(200).json({
        message: "RCP session ended",
        session: {
          id: rcpSession.id,
          studentId: rcpSession.student.id,
          startedAt: rcpSession.startedAt,
          endedAt: rcpSession.endedAt,
          duration: rcpSession.duration,
          avgPulmonaryPressure: rcpSession.avgPulmonaryPressure,
          avgVentilation: rcpSession.avgVentilation,
          avgCorrectPosition: rcpSession.avgCorrectPosition,
          observation: rcpSession.observation,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Failed to end RCP session" });
    }
  };

  // PATCH /students/:id/rcp-sessions/:sessionId
  // Permite al docente editar la observación general y las observaciones por evento
  static updateSessionObservations = async (req: Request, res: Response) => {
    const { id, sessionId } = req.params;
    const { observation, events } = req.body;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);
    const sessionEventRepository = AppDataSource.getRepository(SessionEvent);

    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "estudiante" },
      });
    } catch {
      return res.status(404).json({ message: "Student not found" });
    }

    let rcpSession: RcpSession;
    try {
      rcpSession = await rcpSessionRepository.findOneOrFail({
        where: { id: Number(sessionId), student: { id: String(id) } },
        relations: ["student"],
      });
    } catch {
      return res.status(404).json({ message: "RCP session not found" });
    }

    if (observation !== undefined) {
      rcpSession.observation = observation;
    }

    try {
      await rcpSessionRepository.save(rcpSession);

      // Actualizar observaciones por evento
      if (events && Array.isArray(events) && events.length > 0) {
        for (const evtUpdate of events) {
          if (evtUpdate.id !== undefined) {
            await sessionEventRepository.update(
              { id: evtUpdate.id, session: { id: rcpSession.id } },
              { observation: evtUpdate.observation ?? null }
            );
          }
        }
      }

      return res.status(200).json({ message: "Session observations updated" });
    } catch (error) {
      console.error("Error in updateSessionObservations:", error);
      return res.status(500).json({ message: "Failed to update observations" });
    }
  };

  // GET /students/:id/rcp-sessions/:sessionId
  static getSessionById = async (req: Request, res: Response) => {
    const { id, sessionId } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "estudiante" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    try {
      const session = await rcpSessionRepository
        .createQueryBuilder("session")
        .leftJoinAndSelect("session.events", "events")
        .where("session.id = :sessionId", { sessionId: Number(sessionId) })
        .andWhere("session.student = :studentId", { studentId: String(id) })
        .orderBy("events.sessionTimeSeconds", "ASC")
        .getOne();

      if (!session) {
        return res.status(404).json({ message: "RCP session not found" });
      }

      return res.status(200).json({ session });
    } catch (error) {
      console.error("Error in getSessionById:", error);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  };

  // GET /students/:id/rcp-sessions
  static getStudentSessions = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      page = "1",
      limit = "10",
      startDate,
      endDate,
      isCompleted,
    } = req.query;

    const userRepository = AppDataSource.getRepository(User);
    const rcpSessionRepository = AppDataSource.getRepository(RcpSession);

    let student: User;
    try {
      student = await userRepository.findOneOrFail({
        where: { id: String(id), role: "estudiante" },
      });
    } catch (error) {
      return res.status(404).json({ message: "Student not found" });
    }

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      return res
        .status(400)
        .json({ message: "Invalid page or limit parameters" });
    }

    const queryBuilder = rcpSessionRepository
      .createQueryBuilder("session")
      .leftJoinAndSelect("session.student", "student")
      .where("session.student = :studentId", { studentId: String(id) })
      .select([
        "session.id",
        "session.startedAt",
        "session.endedAt",
        "session.duration",
        "session.avgPulmonaryPressure",
        "session.avgVentilation",
        "session.avgCorrectPosition",
        "session.observation",
        "session.createdAt",
        "student.id",
        "student.username",
        "student.name",
        "student.surname",
      ]);

    if (startDate) {
      try {
        const start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: "Invalid startDate format" });
        }
        queryBuilder.andWhere("session.startedAt >= :startDate", {
          startDate: start,
        });
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
        queryBuilder.andWhere("session.startedAt <= :endDate", {
          endDate: end,
        });
      } catch (error) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }
    }

    if (isCompleted !== undefined) {
      const isCompletedBool = isCompleted === "true";
      queryBuilder.andWhere(
        isCompletedBool
          ? "session.endedAt IS NOT NULL"
          : "session.endedAt IS NULL"
      );
    }

    try {
      const total = await queryBuilder.getCount();

      const sessions = await queryBuilder
        .orderBy("session.startedAt", "DESC")
        .skip(skip)
        .take(limitNumber)
        .getMany();

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
