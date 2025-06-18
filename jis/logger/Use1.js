import {BLogger, ConsoleLogger} from "#app/logger/Logger";

const logger = BLogger(ConsoleLogger);

logger.log(1,2,3)
