import {ILogger} from "../types/declare/logger.js";

export class AwsLogger extends ILogger {
    debug(msg = "") {
        console.log('AwsLogger:' + msg)
    }

}