import {isEmpty, None, Option, Some} from "@smuzi/std";
import {
    migrationLogRowSchema,
    TDatabaseClient,
    TMigrationLogAction,
    TMigrationLogRowSchema,
    TMigrationsLogRepository
} from "@smuzi/database";
import { type Logger } from "./types.js";


export class PostgresLogger implements Logger {
    #dbClient: TDatabaseClient;
    #table: string;

    constructor(table: string, dbClient: TDatabaseClient) {
        this.#dbClient = dbClient;
        this.#table = table;
    }

    async insert(creds): Promise<any>{
        return this.#dbClient.insertRow(this.#table, "", creds);
    }

    async info() {

    }

    async error() {
        
    }

}