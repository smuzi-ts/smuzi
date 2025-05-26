import {IContainer} from "./container";
import {ILogger} from "./logger";

export interface ICore {
    container: IContainer
    logger: () => ILogger
}

declare global {
    const core: ICore
}
