import { Migration, Migrations, TDatabaseClient } from "@smuzi/database";
import { Err, None, Ok, Option, panic, Result, Some, StdError } from "@smuzi/std";

export const LOGGER_UI_USERS_DEFAULT_TABLE = "logger_ui_users";

export type LoggerUiUser = {
    id: number,
    email: string,
    password_hash: string,
    created_at: Date,
}

// The table name is interpolated into SQL, so only plain identifiers are accepted.
function assertTableName(table: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
        panic(`Invalid logger UI users table name '${table}'`);
    }

    return table;
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export const loggerUiMigrations = (users_table: string = LOGGER_UI_USERS_DEFAULT_TABLE) => {
    const table = assertTableName(users_table);
    const migrations = Migrations('smuzi:logger-ui:');
    migrations.add('create_' + table, Migration(
        {
            up: () => (`
            CREATE TABLE IF NOT EXISTS ${table} (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );`
            ),

            down: () => `DROP TABLE IF EXISTS ${table};`
        }))

    return migrations;
}

export class LoggerUiUsersRepository {
    #db_client: TDatabaseClient;
    #table: string;

    constructor(table: string, db_client: TDatabaseClient) {
        this.#db_client = db_client;
        this.#table = assertTableName(table);
    }

    async #findOne(where: string, value: unknown): Promise<Result<Option<LoggerUiUser>, StdError>> {
        const result = await this.#db_client.query<LoggerUiUser>(
            `SELECT id, email, password_hash, created_at FROM ${this.#table} WHERE ${where} = $1 LIMIT 1`,
            [value]
        );
        if (result.isErr()) {
            return Err(result.unsafeSource().toError());
        }

        const row = result.unwrap().rows.unsafeSource()[0] as LoggerUiUser | undefined;

        return Ok(row === undefined ? None() : Some(row));
    }

    async findByEmail(email: string): Promise<Result<Option<LoggerUiUser>, StdError>> {
        return this.#findOne("email", normalizeEmail(email));
    }

    async findById(id: number): Promise<Result<Option<LoggerUiUser>, StdError>> {
        return this.#findOne("id", id);
    }

    async create(email: string, password_hash: string): Promise<Result<LoggerUiUser, StdError>> {
        const result = await this.#db_client.query<LoggerUiUser>(
            `INSERT INTO ${this.#table} (email, password_hash, created_at) VALUES ($1, $2, $3)
             RETURNING id, email, password_hash, created_at`,
            [normalizeEmail(email), password_hash, new Date()]
        );
        if (result.isErr()) {
            return Err(result.unsafeSource().toError());
        }

        return Ok(result.unwrap().rows.unsafeSource()[0] as LoggerUiUser);
    }

    // Updates only the single row matching this email; never touches any other row.
    async updatePasswordByEmail(email: string, password_hash: string): Promise<Result<Option<LoggerUiUser>, StdError>> {
        const result = await this.#db_client.query<LoggerUiUser>(
            `UPDATE ${this.#table} SET password_hash = $2 WHERE email = $1
             RETURNING id, email, password_hash, created_at`,
            [normalizeEmail(email), password_hash]
        );
        if (result.isErr()) {
            return Err(result.unsafeSource().toError());
        }

        const row = result.unwrap().rows.unsafeSource()[0] as LoggerUiUser | undefined;

        return Ok(row === undefined ? None() : Some(row));
    }
}
