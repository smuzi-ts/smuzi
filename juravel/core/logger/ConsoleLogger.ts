import type {ILogger} from "../types/logger";

export class ConsoleLogger implements ILogger {
    debug(...data: any[]): void {
        console.debug(...data)
    }
}