import { StdError } from "./error.js";
import {OptionFromNullable, Some} from "#lib/option.js";
import {dump} from "#lib/debug.js";
import {asString} from "#lib/checker.js";

export function panic(err: any): never {
    if ( err instanceof StdError) {
        throw err;
    }

    if ( err instanceof Error) {
        throw new StdError("",  asString(err.message) ? err.message : "", OptionFromNullable(err.stack), Some(err));
    }

    const errorForStack = new Error();

    if (asString(err)) {
        throw new StdError("",  err, OptionFromNullable(errorForStack.stack));
    }

    if (asString(err.message)) {
       throw new StdError(asString(err.code) ? err.code : "",  err.message, OptionFromNullable(err.stack ?? errorForStack.stack), Some(err));
    }

    throw new StdError("undefined",  "Undefined error", OptionFromNullable(errorForStack.stack), Some(err));

}