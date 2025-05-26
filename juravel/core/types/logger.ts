export const LOGGER_CONTAINER_KEY = 'ILogger';

export type ILoggerConfig = {
    instance: string,
    services: []
}

export interface ILogger {
    debug(...data: any[]): void;
}

