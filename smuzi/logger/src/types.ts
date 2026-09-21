export interface Logger {
    info(): Promise<void>
    error(): Promise<void>
}