import {TInputParser} from "#lib/input-parsers/types.js";
import {ConsoleRouter} from "#lib/router.js";
import {TOutputConsole} from "#lib/output/types.js";

export type TConsoleConfig = {
    inputParser: TInputParser,
    router: ConsoleRouter,
    output: TOutputConsole,
};

export const ConsoleConfig = (config: TConsoleConfig): TConsoleConfig => config;
