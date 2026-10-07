#!/usr/bin/env node
import { env, Some } from "@smuzi/std";
import { postgresClient } from "@smuzi/db-postgres";
import { PostgresLogger } from "@smuzi/logger";
import { loggerMcpConfigFromEnv } from "./config.js";
import { createLoggerMcpServer } from "./server.js";
import { LoggerTools } from "./tools.js";

const config = loggerMcpConfigFromEnv();

const db_client = postgresClient({
    host: env("DB_HOST", Some("localhost")),
    port: Number(env("DB_PORT", Some("5432"))),
    database: env("DB_DATABASE"),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
});

const logger = new PostgresLogger(env("LOGGER_TABLE", Some("logs")), db_client);

createLoggerMcpServer(new LoggerTools(logger), config).listen(config.port, config.host, () => {
    console.error(`logger-mcp listening on http://${config.host}:${config.port}${config.path}`);
});
