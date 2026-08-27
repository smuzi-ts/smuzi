import {dump} from "./debug.js";

export * from "./checker.js";
export * from "./option.js";
export * from "./result.js";
export * from "./match.js";
export * from "./pipeline.js";
export * from "./panic.js";
export * from "./debug.js";
export * from "./common.js";
export * from "./dotEnv.js";
export * from "./object.js";
export * from "./promise.js";
export * from "./json.js";
export * from "./utilTypes.js";
export * from "./path.js";
export * from "./http.js";
export * from "./error.js";
export * from "./record.js";
export * from "./map.js";
export * from "./list.js";
export * from "./common.js";
export * from "./uuid.js";
export * from "./regexp.js";
export * from "./querystring.js";
export * from "./enum.js";
export * from "./trait.js";
import * as _url from "./url.js";

export const url = _url;

import * as _scripts from "./scripts.js";
import {None, Option} from "#lib/option.js";
export const scripts = _scripts;

export async function mainAndExit(program: () => unknown, errorHandler = dump) {
    process.on('unhandledRejection', (reason, promise) => {
        errorHandler(reason);
    });

    process.on('uncaughtException', (error) => {
        errorHandler(error);
    });

    try {
        await program();
    } catch (err) {
        errorHandler(err);
    }
    process.exit();
}

type MainProgram = () => Promise<Option> | Promise<void>
type MainErrorHandler = (err: unknown, setup: Option) => Promise<void>

export async function main(program: MainProgram, errorHandler: MainErrorHandler = async (...args) => {dump(args)}) {
    let setup: Option = None();

    process.on('unhandledRejection', async (reason, promise) => {
        await errorHandler(reason, setup);
    });

    process.on('uncaughtException', async (error) => {
        await errorHandler(error, setup);
    });

    try {
        setup = (await program()) ?? None();
    } catch (err) {
        await errorHandler(err, setup);
    }
}

