import {isNull, isString} from "#lib/checker.js";
import {isNone, None, Some} from "#lib/option.js";
import {Err, Ok, Result} from "#lib/result.js";

function reviver(this, key, value) {
    return isNull(value) ? None() : Some(value);
}

function replacer(this, key, value) {
    return isNone(value) ? null : value;
}

type JsonParsingError = {
    message: string
}

export const json = {
    fromString(value: string): Result<unknown, JsonParsingError> {
        try {
            return Ok(JSON.parse(value, reviver));
        } catch (e) {
            return Err({message: e.message});
        }
    },
    toString(value: unknown) {
        try {
            return Ok(JSON.stringify(value, replacer));
        } catch (e) {
            return Err({message: e.message});
        }
    }
}
