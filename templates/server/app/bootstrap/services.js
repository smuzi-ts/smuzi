import {LOGGER_CONTAINER_KEY} from "@juravel/core/types/logger.ts";
import {ConsoleLogger} from "@juravel/core/logger/ConsoleLogger.ts";

export default () => {
    core.container.bind(LOGGER_CONTAINER_KEY, new ConsoleLogger())
};