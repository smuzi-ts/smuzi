export enum LogLevel {
    info = 'info',
    error = 'error'
}

export type LogDetails = {
    message: unknown,
    tags?: Record<string, string|boolean|number>,
    trace_id?: string,
}

export interface Logger {
    info(log_details: LogDetails): Promise<void>
}

