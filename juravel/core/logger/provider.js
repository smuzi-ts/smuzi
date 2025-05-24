import {FSLogger} from "./fsLogger.js";

export function providerLogger() {
    let instance = undefined;

    switch (core.config.logger.instance) {
        case "fs":
            instance = new FSLogger(core.config.logger.options)
    }

    console.log('providerLogger', instance)
    
    core.container.bindOnce('ILogger', instance)
}