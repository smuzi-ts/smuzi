import type {ILogger} from "../types/logger";

export class FSLogger implements ILogger {
    debug(msg: string): void {
        console.log("FSLogger=" + msg)
    }
}