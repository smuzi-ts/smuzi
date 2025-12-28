import {DatabaseConfig, Migrations} from "@smuzi/database";
import {buildPostgresEntityRepository, buildPostgresMigrationsLogRepository, postgresClient} from "@smuzi/db-postgres";
import {usersMigrations} from "#users/database/migrations/index.js";
import {env} from "@smuzi/std";

const services = {
    default: {
        client: postgresClient({
            host: env("DB_HOST"),
            port: parseInt(env("DB_PORT")),
            database: env("DB_DATABASE"),
            user: env("DB_USER"),
            password: env("DB_PASSWORD"),
        }),
        buildMigrations: () => {
            const migrations = Migrations();
            migrations.group(usersMigrations);

            return migrations;
        },
        buildMigrationLogRepository: buildPostgresMigrationsLogRepository
    }
}



