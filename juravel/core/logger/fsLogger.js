import {ILogger} from "../types/declare/logger.js";

export class FSLogger extends ILogger {
    #log (level = "", msg = "") {
        console.log('FSLogger config:' + core.config.logger.options.maxFiles)
    }

    debug(msg = "") {
        this.#log("DEBUG", )
    }
}