import { DatabaseConfig, Migrations } from "@smuzi/database";
import { buildPostgresEntityRepository, buildPostgresMigrationsLogRepository, postgresClient } from "@smuzi/db-postgres";
import { env } from "@smuzi/std";
import { postgresMigrations } from "@crmoz/zoho-oauth";

const services = {
    core: {
        client: postgresClient({
            host: env("DB_HOST"),
            port: parseInt(env("DB_PORT")),
            database: env("DB_DATABASE"),
            user: env("DB_USER"),
            password: env("DB_PASSWORD"),
        }),

        //Migrations
        buildMigrations: () => {
            const migrations = Migrations();
            migrations.group(postgresMigrations('zoho_oauth_credentials'));

            return migrations;
        },

        buildMigrationLogRepository: buildPostgresMigrationsLogRepository
    }
}

export const databaseConfig = {
    services,
    default: services.core,
}


