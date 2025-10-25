import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Sesion } from "./entity/Sesion";

export const AppDataSource = new DataSource({
<<<<<<< HEAD
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "1234",
    database: "login_node",
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
=======
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Elias985420us",
  database: "api_rcp",
  synchronize: true,
  logging: false,
  entities: [User, Sesion],
  migrations: [],
  subscribers: [],
  extra: {
    authPlugin: "mysql_native_password",
  },
});
>>>>>>> devElias
