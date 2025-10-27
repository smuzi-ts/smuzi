import {TOutputConsole, TThemaOutputConsole} from "#lib/output/types.ts";

export const StandardOutput = (thema: TThemaOutputConsole): TOutputConsole => ({
    info: console.debug,
    success: console.log,
    warn: console.warn,
    error: console.error,
    bold: console.log,
})