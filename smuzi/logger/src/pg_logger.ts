import {isEmpty, None, Option, Some} from "@smuzi/std";
import {
    TDatabaseClient,
} from "@smuzi/database";
import { type Logger, LogDetails, LogLevel } from "./index.js";

export class PostgresLogger implements Logger {
    #dbClient: TDatabaseClient;
    #table: string;

    constructor(table: string, dbClient: TDatabaseClient) {
        this.#dbClient = dbClient;
        this.#table = table;
    }

    async #insert(log_details: LogDetails): Promise<unknown> {
        if (log_details.created_at == undefined) {
            log_details.created_at =Temporal.Now.instant();
        }
        return this.#dbClient.insertRow(this.#table, log_details);
    }

    async info(log_details: LogDetails) {
        log_details.level = LogLevel.info;
        
        this.#insert(log_details);
    }

    async error(log_details: LogDetails) {
        log_details.level = LogLevel.error;
        
        this.#insert(log_details);
    }

}