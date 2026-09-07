import { Option, OptionFromNullable, None, Some } from "./option.js";
import { asNumber, asObject, asString, isNull } from "./checker.js";
import {dump} from "./debug.js";

export class StdError {
    message: string
    trace: Option<string>
    origin: Option

    constructor(
        message: string = "",
        trace: Option<string> = None(),
        origin: Option = None(),
    ) {
        this.message = message;
        this.trace = trace;
        this.origin = origin;
    }
}

export function transformError(err: any): StdError {
    if (err instanceof StdError) {
        return err;
    }

    if (asObject(err)) {
        return new StdError(
            asString(err.message) ? err.message : "",
            asString(err.stack) ? Some(err.stack) : None(),
            Some(err)
        )
    }

    return new StdError(
        asString(err) ? err : "Unknown error",
        Some(new Error().stack ?? ''),
        asString(err) ? None() : OptionFromNullable(err)
    )
}
