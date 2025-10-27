import {DatabaseConfig, Migrations} from "@smuzi/database";
import {postgresClient} from "@smuzi/db-postgres";
import { env } from "node:process";
import {usersMigrations} from "#users/database/migrations/index.ts";

const services = {
    default: {
        client: await postgresClient({
            host: env.DB_HOST,
            port: Number(process.env.DB_PORT),
            database: env.DB_DATABASE,
            user: env.DB_USER,
            password: env.DB_PASSWORD ?? '',
        }),
        migrations: () => {
            const migrations = Migrations();
            migrations.group(usersMigrations);

            return migrations;
        }
    }
}

export const databaseConfig = new DatabaseConfig({
    services,
    current: services.default,
});

