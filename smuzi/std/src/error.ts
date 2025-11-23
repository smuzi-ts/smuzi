import { Option, OptionFromNullable, None, Some } from "#lib/option.js";
import { asObject, asString } from "#lib/checker.js";
import { dump } from "./debug.js";

export type StdError = {
    code: Option<number|string>,
    message: Option<string>,
    trace: Option<string>,

}

export function tranformError(err: unknown): StdError {
    if (! asObject(err)) {
        return {
            code: None(),
            message: asString(err) ? Some(err) : None(),
            trace: None(),
        }
    }

    return {
        code: OptionFromNullable(err?.code as string|number),
        message: OptionFromNullable(err?.message as string),
        trace: OptionFromNullable(err?.stack as string),
    }
}