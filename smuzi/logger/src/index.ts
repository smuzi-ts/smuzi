export * from "./migrations.js";
export * from "./pg_logger.js";

export enum LogLevel {
    info = 200,
    error = 400,
}

export type LogDetails = {
    message: unknown,
    tags?: Record<string, string | boolean | number>,
    trace_id?: string,
    level?: number,
    created_at?: Temporal.Instant,
}


export interface Logger {
    info(log_details: LogDetails): Promise<void>
    error(log_details: LogDetails): Promise<void>
}
