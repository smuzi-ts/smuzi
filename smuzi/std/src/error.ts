import { Option, OptionFromNullable, None, Some } from "#lib/option.js";
import { asNumber, asObject, asString, isNull } from "#lib/checker.js";

export class StdError {
    code: number | string
    message: string
    trace: Option<string>
    origin: Option

    constructor(
        code: string| number = "",
        message: string = "",
        trace: Option<string> = None(),
        origin: Option = None(),
    ) {
        this.code = code;
        this.message = message;
        this.trace = trace;
        this.origin = origin;
    }
}

export function tranformError(err: unknown): StdError {
    if (asObject(err)) {
        return {
            code: isNull(err.code) ? "" : asString(err.code) || asNumber(err.code) ? err.code : "",
            message: isNull(err.code) ? "" : asString(err.code) ? err.code : "",
            trace: OptionFromNullable(err?.stack as string),
            origin: None()
        }
    }

    return new StdError(
        "",
        asString(err) ? err : "Unknown error",
        None(),
        asString(err) ? None() : OptionFromNullable(err)
    )
}
