import {BLogger, ConsoleLogger} from "#app/logger/Logger";

const Logger = BLogger(ConsoleLogger);

Logger.log(1,2,3)
