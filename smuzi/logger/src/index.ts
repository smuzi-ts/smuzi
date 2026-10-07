export * from "./migrations.js";
export * from "./pg_logger.js";
export * from "./console_logger.js";
export * from "./reader.js";
export * from "./query.js";
export * from "./actions.js";
export * from "./router.js";

import type { LogContentType, RetryConfig } from "./reader.js";

export enum LogLevel {
    info = 200,
    error = 400,
}

export type LogDetails = {
    message: unknown,
    content_type?: LogContentType,
    tags?: Record<string, string | boolean | number>,
    trace_id?: string,
    level?: number,
    created_at?: Temporal.Instant,
    stack_trace?: string,
    retry?: RetryConfig,
}


export interface Logger<R> {
    info(log_details: LogDetails): Promise<R>
    error(log_details: LogDetails): Promise<R>
}
