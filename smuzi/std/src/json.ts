import {asObject, isNull, isObject, isString} from "#lib/checker.js";
import {isNone, isOption, None, Option, Some} from "#lib/option.js";
import {Err, isResult, Ok, Result} from "#lib/result.js";
import { dump } from "./debug.js";
import { StdRecord } from "./record.js";
import { Primitive } from "./utilTypes.js";


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
    if (isObject(value)) {
        return Some(new StdRecord(value));
    }

    let newValue = value;

    if (isNull(value)) {
        return None();
    }


    if (value?.__type && value.val) {
        newValue =  value.__type.match({
            Some: type => {
                return type === 'ok' ? Ok(value.val) : (type === 'err' ? Err(value.val) : Some(value))
            },
            None: () => value
        })
    }

    if (isObject(this)) {
        return newValue;
    }

    return Some(newValue);
}

function eachToString(this, key, value) {
    if (isOption(value)) {
        return value.match({
            None:() => null,
            Some: (v) => v
        });
    }

    if (isResult(value)) {
        return value.match({
            Ok:(val) => ({__type:'ok', val}),
            Err: (val) => ({__type:'err', val}),
        });
    }

    return value;
}

export const json = {
    fromString<T = unknown>(value: string): Result<OutputJsonFromString<T>, JsonFromStringError> {
        try {
            return Ok(JSON.parse(value, eachFromString));
        } catch (err) {
            return Err(new JsonFromStringError(err.message ?? "Unknown JSON parsing error"));
        }
    },
    toString(value: unknown):Result<string, JsonToStringError> {
        try {
            return Ok(JSON.stringify(value, eachToString));
        } catch (err) {
            return Err(err);
        }
    }
}
