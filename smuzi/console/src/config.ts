import {TInputParser} from "./input-parsers/types.js";
import {ConsoleRouter} from "./router.js";
import {TOutputConsole} from "./output/types.js";

export type TConsoleConfig = {
    inputParser: TInputParser,
    router: ConsoleRouter,
    output: TOutputConsole,
};

export const ConsoleConfig = (config: TConsoleConfig): TConsoleConfig => config;
