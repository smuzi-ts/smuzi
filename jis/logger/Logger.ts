export const BLogger = (loggerInstance: ILogger): ILogger => ({
    log(...args) {
        loggerInstance.log(...args)
    },
    error(...args) {
        loggerInstance.error(...args)
    },
})

export const ConsoleLogger: ILogger = {
    log: (...args: any[]) => console.log(...args),
    error: (...args: any[]) => console.error(...args)
}

/**
 * Declare
 */

export interface ILogger {
    log(...args): void
    error(...args): void
}