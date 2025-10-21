import {TInputCommand, TInputParams, TInputParser} from "#lib/input-parsers/TInputParser.js";

export const SystemInputParser: TInputParser = (processArgv: string): TInputCommand => {
    const [, , path, ...args] = process.argv;

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