import {FSLogger} from "./fsLogger.ts";

export function providerLogger(
    instance = "",
    options = [],
) {
    switch (core.config.logger.instance) {
        case "fs":
            instance = new FSLogger(core.config.logger.options)
    }

    core.container.bindOnce('ILogger', instance)
}