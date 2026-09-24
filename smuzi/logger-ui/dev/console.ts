import { env, Some } from "@smuzi/std";
import { postgresClient } from "@smuzi/db-postgres";
import { commandHandler, ConsoleConfig, CreateConsoleRouter, StandardOutput, SystemInputParser } from "@smuzi/console";
import {
    LOGGER_UI_USERS_DEFAULT_TABLE,
    loggerUiConsole,
    loggerUiMigrations,
    LoggerUiUsersRepository,
} from "#lib/index.js";

// Local console: pnpm console logger-ui:users:create --email=admin@example.com
const users_table = env("LOGGER_UI_USERS_TABLE", Some(LOGGER_UI_USERS_DEFAULT_TABLE));

const db_client = postgresClient({
    host: env("DB_HOST", Some("localhost")),
    port: Number(env("DB_PORT", Some("5432"))),
    database: env("DB_DATABASE"),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
});

// Dev shortcut; in an app these migrations are grouped into the app's migrations list.
for (const migration of loggerUiMigrations(users_table).getList().values()) {
    (await db_client.query(migration.up())).unwrap();
}

const router = CreateConsoleRouter();
router.group(loggerUiConsole(new LoggerUiUsersRepository(users_table, db_client)));

await commandHandler(process.argv, ConsoleConfig({
    inputParser: SystemInputParser,
    router,
    output: StandardOutput(),
}));

process.exit();
