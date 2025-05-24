export type ILoggerConfig = {
    instance: string,
    options?: IFileLoggerOptionConfig | IConsoleLoggerOptionConfig | {}
}

export interface ILogger {
    debug(msg: string): void
    marianna(msg: string): void
}

