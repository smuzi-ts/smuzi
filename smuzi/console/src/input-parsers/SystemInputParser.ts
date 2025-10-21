import {TInputParser} from "#lib/input-parsers/TInputParser.js";
import {TInputCommand} from "#lib/router.js";

export const SystemInputParser: TInputParser = (processArgv: string[]): TInputCommand => {
    const [, , path, ...args] = processArgv;

    const params = {};

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            params[key] = value ?? true;
        }
    }

    return {
        path,
        params
    }
}