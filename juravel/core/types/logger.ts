export const LOGGER_SERVICE_KEY = 'ILogger';

export type ILoggerConfig = {
    instance: string,
    services: []
}

export interface ILogger {
    debug(msg: string): void
}

