import {DatabaseConfig, Migrations} from "@smuzi/database";
import {postgresClient} from "@smuzi/db-postgres";
import { env } from "node:process";
import {usersMigrations} from "#users/database/migrations/index.ts";

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
    migrations: () => {
        const migrations = Migrations();
        migrations.group(usersMigrations);

        return migrations;
    },
    connections,
    connection: connections.default,
});

