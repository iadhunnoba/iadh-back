import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { DataMqtt } from "./entity/DataMqtt"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "login_node",
    synchronize: true,
    logging: false,
    entities: [User, DataMqtt],
    migrations: [],
    subscribers: [],
})
