import {Struct} from "@smuzi/std";
import {TInputParser} from "#lib/input-parsers/types.ts";
import {ConsoleRouter} from "#lib/router.ts";
import {TOutputConsole} from "#lib/output/types.ts";

export type TConsoleConfig = {
    inputParser: TInputParser,
    router: ConsoleRouter,
    output: TOutputConsole,
};

export const ConsoleConfig = Struct<TConsoleConfig>();
