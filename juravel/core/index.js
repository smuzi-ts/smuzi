import {container} from "./container/container.js"

export const core = {
    container,
    config: null,
    logger: () => container.resolve('ILogger'),
}