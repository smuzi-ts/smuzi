import {TInputCommand, TInputParams} from "#lib/router.js";
import {dump, StdRecord} from "@smuzi/std";

export function SystemInputParser<ParamsKeys extends string = string>(processArgv: string[]): TInputCommand<ParamsKeys> {
    const [, , path, ...args] = processArgv;

    const params = new StdRecord<ParamsKeys, string>();

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            dump({key, value})
            params.setOther(key, value ?? "");
        }
    }



    return {
        path,
        params,
    }
}

export function SystemInputParserWithoutPath<ParamsKeys extends string = string>(processArgv: string[]): {params: TInputParams<ParamsKeys>} {
    const [, , ...args] = processArgv;

    const params = new StdRecord<ParamsKeys, string>();

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            params.setOther(key, value ?? "");
        }
    }



    return {
        params,
    }
}