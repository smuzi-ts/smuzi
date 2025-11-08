import {isNull, isString} from "#lib/checker.js";
import {isNone, isOption, None, Some} from "#lib/option.js";
import {Err, isResult, Ok, Result} from "#lib/result.js";

function reviver(this, key, value) {
    return isNull(value) ? None() : Some(value);
}

function replacer(this, key, value) {
    if (isOption(value)) {
        return value.match({
            None:() => null,
            Some: (v) => v
        });
    }

    if (isResult(value)) {
        return value.match({
            Ok:(v) => ({__type:'ok',v}),
            Err: (v) => ({__type:'err',v}),
        });
    }

    return value;
}

type JsonToStringError = {
    message: string
}

type JsonFromStringError = {
    message: string
}

export const json = {
    fromString(value: string): Result<unknown, JsonFromStringError> {
        try {
            return Ok(JSON.parse(value, reviver));
        } catch (e) {
            return Err({message: e.message});
        }
    },
    toString(value: unknown):Result<string, JsonToStringError> {
        try {
            return Ok(JSON.stringify(value, replacer));
        } catch (e) {
            return Err({message: e.message});
        }
    }
}
