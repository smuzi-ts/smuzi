import {DatabaseConfig, Migrations} from "@smuzi/database";
import createUsersTable from "#users/database/migrations/createUsersTable.ts";
import {postgresClient} from "@smuzi/db-postgres";
import { env } from "node:process";

const migrations = Migrations();
migrations.add(createUsersTable);

const connections = {
    default: await postgresClient({
        host: env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: env.DB_DATABASE,
        user: env.DB_USER,
        password: env.DB_PASSWORD ?? '',
    })
}

export const databaseConfig = new DatabaseConfig({
    migrations,
    connections,
    connection: connections.default,
});

