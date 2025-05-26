import {ConsoleLogger} from "./ConsoleLogger.ts";
import {LOGGER_CONTAINER_KEY} from "../types/logger.ts";

export function loggerProvider(firstOption) {
    core.container.singleton(LOGGER_CONTAINER_KEY, new ConsoleLogger(firstOption))
}
