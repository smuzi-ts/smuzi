import { type Logger, LogDetails, LogLevel } from "./index.js";

export class ConsoleLogger implements Logger<void> {
    async #log(log_details: LogDetails, output: (...args: unknown[]) => void) {
        if (log_details.created_at == undefined) {
            log_details.created_at = Temporal.Now.instant();
        }
        output(log_details);
    }

    async info(log_details: LogDetails) {
        log_details.level = LogLevel.info;

        return this.#log(log_details, console.log);
    }

    async error(log_details: LogDetails) {
        log_details.level = LogLevel.error;

        return this.#log(log_details, console.error);
    }
}
