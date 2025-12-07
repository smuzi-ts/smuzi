import {isArray, isNull, isObject} from "#lib/checker.js";
import {isOption, isSome, None, Option, OptionFromNullable, Some} from "#lib/option.js";
import {Err, isResult, Ok, Result} from "#lib/result.js";
import {StdList} from "#lib/list.js";
import {StdRecord} from "#lib/record.js";


// type OutputJsonFromString = Option<Primitive | Primitive[] | StdRecord<string | number , unknown>> 
type OutputJsonFromString<T> = Option<T>;

class JsonFromStringError {
    message: string

    constructor(message: string) {
        this.message = message;
    }
}

class JsonToStringError {
    message: string

    constructor(message: string) {
        this.message = message;
    }
}

function eachFromString(this, key, value) {
    if (isArray(value)) {
        return Some(new StdList(value));
    }

    if (isObject(value)) {
        return Some(new StdRecord(value));
    }

    let newValue = value;

    if (isNull(value)) {
        return None();
    }

    if (isObject(this)) {
        return newValue;
    }

    return Some(newValue);
}

function eachToString(this, key, value) {
    if (isOption(value)) {
        return value.match({
            None: () => null,
            Some: (v) => v
        });
    }

    if (isResult(value)) {
        return value.match({
            Ok: (val) => ({__type: 'ok', val}),
            Err: (val) => ({__type: 'err', val}),
        });
    }

    return value;
}

export const json = {
    fromString<T = unknown>(value: string): Result<OutputJsonFromString<T>, JsonFromStringError> {
        try {
            let result = JSON.parse(value, eachFromString);
            return  Ok(isOption(result) ? result : OptionFromNullable(result));
        } catch (err) {
            return Err(new JsonFromStringError(err.message ?? "Unknown JSON parsing error"));
        }
    },
    toString(value: unknown): Result<string, JsonToStringError> {
        try {
            return Ok(JSON.stringify(value, eachToString));
        } catch (err) {
            return Err(err);
        }
    }
}
