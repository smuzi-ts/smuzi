import {TOutputConsole, TThemaOutputConsole} from "#lib/output/types.ts";

export const StandardOutput = (thema: TThemaOutputConsole): TOutputConsole => ({
    info: console.log,
    success: console.log,
    warn: console.log,
    error: console.log,
    bold: console.log,
})