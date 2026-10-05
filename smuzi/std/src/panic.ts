import { StdError } from "./error.js";
import {None, Option, OptionFromNullable, Some} from "./option.js";
import {dump} from "./debug.js";
import {asObject, asString} from "./checker.js";
import { StdJson } from "./json.js";

export function panic(err: any): never {
    if ( err instanceof StdError) {
        throw err;
    }

    if ( err instanceof Error) {
        throw new StdError(asString(err.message) ? err.message : "", OptionFromNullable(err.stack), Some(err));
    }

    const errorForStack = new Error();

    if (asString(err)) {
        throw new StdError(  err, OptionFromNullable(errorForStack.stack));
    }

    let error = new StdError;
    error.trace = None();
    error.message = "";
    error.origin = Some(err);

    if (asObject(err)) {
        if (Object.hasOwn(err, "message")) {
            error.message = asString(err.message) ? err.message : StdJson.toString(err.message).okOr("Unparsed error.message in panic call")
        } else {
            error.message = "";
        }
        
        if (Object.hasOwn(err, "stack") && err.stack != null) {
            error.trace = OptionFromNullable(err.stack as string);
        } else {
            error.trace = Some(errorForStack.stack ?? "");
        }
    }

    throw error;
}