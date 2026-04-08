import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { RcpSession } from "./entity/RcpSession";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "985420",
  database: "iadh_db",
  synchronize: true,
  logging: false,
  entities: [User, RcpSession],
  migrations: [],
  subscribers: [],
});
