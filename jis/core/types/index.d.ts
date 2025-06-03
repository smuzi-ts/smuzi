import {IContainer} from "./container";
import {ILogger} from "./logger";

export interface ICore {
    container: IContainer
}

declare global {
    const core: ICore
    const logger: ILogger
}
