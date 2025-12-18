import {TInputCommand, TInputParams} from "#lib/router.js";
import {StdMap} from "@smuzi/std";

export function SystemInputParser<K extends string = string>(processArgv: string[]): TInputCommand<K> {
    const [, , path, ...args] = processArgv;

    const params = new StdMap<K, string>();

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split("=");
            params.setOther(key, value ?? "");
        }
    }



    return {
        path,
        params,
    }
}

export function SystemInputParserWithoutPath<K extends string = string>(processArgv: string[]): {params: TInputParams<K>} {
    const [, , ...args] = processArgv;

    const params = new StdMap<K, string>();

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