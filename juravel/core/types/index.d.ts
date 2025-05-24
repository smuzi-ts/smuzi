import {IContainer} from "./container";
import {ILogger} from "./logger";
import {IConfig} from "./config";

export interface ICore {
    container: IContainer
    config: IConfig
    logger: () => ILogger
}

declare global {
    const core: ICore
}

