import {loggerProvider} from "@juravel/core/logger/provider.js";

export const providers = [
    () => loggerProvider(config.logger.console.firstOption),
]