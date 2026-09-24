import { env, Some } from "@smuzi/std";
import { postgresClient } from "@smuzi/db-postgres";
import { LogDetails, PostgresLogger, postgresMigrations } from "@smuzi/logger";
import { LOGGER_UI_DEFAULT_PORT, runLoggerUi } from "#lib/index.js";

// Standalone UI for local development: pnpm serve [--seed]
const table = env("LOGGER_TABLE", Some("logs"));

const db_client = postgresClient({
    host: env("DB_HOST", Some("localhost")),
    port: Number(env("DB_PORT", Some("5432"))),
    database: env("DB_DATABASE"),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
});

const logger = new PostgresLogger(table, db_client);

async function seed() {
    for (const migration of postgresMigrations(table).getList().values()) {
        (await db_client.query(migration.up())).unwrap();
    }

    const requests: { trace_id: string, route: string, user_id: number, fail: boolean }[] = [
        { trace_id: crypto.randomUUID(), route: "/orders", user_id: 12, fail: false },
        { trace_id: crypto.randomUUID(), route: "/orders/7", user_id: 12, fail: true },
        { trace_id: crypto.randomUUID(), route: "/users", user_id: 5, fail: false },
    ];

    for (const request of requests) {
        const tags: LogDetails["tags"] = { route: request.route, user_id: request.user_id };
        (await logger.info({ trace_id: request.trace_id, message: "request started", tags })).unwrap();
        (await logger.info({ trace_id: request.trace_id, message: JSON.stringify({ query: "SELECT 1", ms: 3 }), tags: { ...tags, db: true } })).unwrap();

        if (request.fail) {
            (await logger.error({ trace_id: request.trace_id, message: "Order not found", tags: { ...tags, status: 404 } })).unwrap();
        } else {
            (await logger.info({ trace_id: request.trace_id, message: "request finished", tags: { ...tags, status: 200 } })).unwrap();
        }
    }

    (await logger.info({ message: "worker heartbeat", tags: { worker: "mailer" } })).unwrap();
}

if (process.argv.includes("--seed")) {
    await seed();
}

(await runLoggerUi(logger, {
    host: env("LOGGER_UI_HOST", Some("localhost")),
    port: Number(env("LOGGER_UI_PORT", Some(String(LOGGER_UI_DEFAULT_PORT)))),
    prefix: env("LOGGER_UI_PREFIX", Some("")),
})).unwrap();
