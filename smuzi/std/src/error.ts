import { Option, OptionFromNullable, None, Some } from "#lib/option.js";
import { asNumber, asObject, asString, isNull } from "#lib/checker.js";

export type StdError = {
    code: number | string,
    message: string,
    trace: Option<string>,
    origin: Option<unknown>,
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

    return {
        code: "",
        message: asString(err) ? err : "Unknown error",
        trace: None(),
        origin: asString(err) ? None() : OptionFromNullable(err),
    }


}