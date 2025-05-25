import {IContainer} from "./container";
import {IConfig} from "./config";
import {ILogger} from "./logger";

export interface ICore {
    container: IContainer
    config: IConfig
    logger: () => ILogger
}

declare global {
    const core: ICore
}

