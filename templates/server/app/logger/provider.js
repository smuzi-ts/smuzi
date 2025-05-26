import {LOGGER_CONTAINER_KEY} from "@juravel/core/types/logger";
import {CustomLogger} from "#app/logger/customLogger";

export function customLoggerProvider() {
    core.container.bindOnce(LOGGER_CONTAINER_KEY, new CustomLogger())
}