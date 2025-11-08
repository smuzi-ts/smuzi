import {isNull, isObject, isString} from "#lib/checker.js";
import {isNone, isOption, None, Option, Some} from "#lib/option.js";
import {Err, isResult, Ok, Result} from "#lib/result.js";

function reviver(this, key, value) {
    if (isNull(value)) {
        return None();
    }

    if (value?.__type && value.val) {
        return value.__type.match({
            Some: type => {
                return type === 'ok' ? Ok(value.val) : (type === 'err' ? Err(value.val) : Some(value))
            },
            None: () => Some(value)
        })
    }

    return Some(value);
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
            Ok:(val) => ({__type:'ok', val}),
            Err: (val) => ({__type:'err', val}),
        });
    }

    return value;
}

export const json = {
    fromString(value: string): Result<Option, Error> {
        try {
            return Ok(JSON.parse(value, reviver));
        } catch (err) {
            return Err(err);
        }
    },
    toString(value: unknown):Result<string, Error> {
        try {
            return Ok(JSON.stringify(value, replacer));
        } catch (err) {
            return Err(err);
        }
    }
}
