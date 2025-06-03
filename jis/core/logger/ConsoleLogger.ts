import type {ILogger} from "../types/logger";


export class ConsoleLogger implements ILogger {

    debug(...vars: any[]): void {
        console.debug(...vars);
    }
}