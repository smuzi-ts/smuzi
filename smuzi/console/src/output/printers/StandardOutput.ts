import { TOutputConsole, TThemaOutputConsole} from "#lib/output/types.js";
import { StandardThema } from "#lib/output/themes/StandardThema.js";

export const StandardOutput = (thema: TThemaOutputConsole = StandardThema): TOutputConsole => ({
    info(...vars) {
        console.debug(thema.info, ...vars, thema.default)
    },
    success(...vars) {
        console.debug(thema.success, ...vars, thema.default)
    },
    warn: console.warn,
    error(...vars) {
        console.error(thema.error, ...vars, thema.default)
    },
    bold: console.log,
})