import {Container} from "./container/container.ts"
import {LOGGER_CONTAINER_KEY} from "./types/logger.ts";

const container = new Container();

export const core = {
    container,
}

export const logger = () => container.resolve(LOGGER_CONTAINER_KEY)
