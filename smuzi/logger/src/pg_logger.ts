import {isEmpty, None, Option, Some} from "@smuzi/std";
import {
    migrationLogRowSchema,
    TDatabaseClient,
    TMigrationLogAction,
    TMigrationLogRowSchema,
    TMigrationsLogRepository
} from "@smuzi/database";
import { type Logger, LogDetails } from "./types.js";
import { log } from "console";


export class PostgresLogger implements Logger {
    #dbClient: TDatabaseClient;
    #table: string;

    constructor(table: string, dbClient: TDatabaseClient) {
        this.#dbClient = dbClient;
        this.#table = table;
    }

    async #insert(log_details: LogDetails): Promise<any>{
        return this.#dbClient.insertRow(this.#table, "", creds);
    }

    async info(log_details: LogDetails) {
        log_details.stream.level = "info";
        
        this.#insert(log_details);
    }

}