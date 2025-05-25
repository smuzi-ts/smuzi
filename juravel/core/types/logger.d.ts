
export type ILoggerConfig = {
    instance: string,
    services: []
}


export interface ILogger {
    debug(msg: string): void
}