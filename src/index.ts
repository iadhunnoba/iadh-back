import * as express from "express";
import { Request, Response } from "express";
import { AppDataSource } from "./data-source";
import * as cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { exec } from "child_process";
import { promisify } from "util";

const PORT = process.env.PORT || 3000;
const execAsync = promisify(exec);

async function runLiquibase() {
  try {
    await execAsync("liquibase --defaultsFile=liquibase.properties update");
    console.log("Liquibase updates applied successfully.");
  } catch (error) {
    console.error("Error applying Liquibase updates:", error);
    throw error; // Propagar el error para que el inicio de la API falle
  }
}

async function startApp() {
  try {
    // Ejecutar Liquibase antes de inicializar la base de datos
    await runLiquibase();

    // Inicializar la conexión de TypeORM
    await AppDataSource.initialize();
    console.log("Database connected.");

    // Crear la aplicación Express
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    // Rutas
    app.use("/", routes);

    // Iniciar el servidor Express
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Error starting the application:", error);
  }
}

startApp();
