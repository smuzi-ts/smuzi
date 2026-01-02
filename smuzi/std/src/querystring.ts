import {Err, Ok, Result} from "#lib/result.js";
import {isOption, Option, OptionFromNullable} from "#lib/option.js";
import {JsonFromStringError} from "#lib/json.js";
import {StdRecord} from "#lib/record.js";
import {StdError, transformError} from "#lib/error.js";
//TODO: rewrite to custom parser instead of Node module
import querystringNode from "querystring"


export const querystring = {
    fromString<T extends Record<string, unknown> =  Record<string, unknown>>(value: string): Result<StdRecord<T>, StdError> {
        try {
            return Ok(new StdRecord<T>(querystringNode.decode(value) as any));
        } catch (err) {
            return Err(transformError(err));
        }
    },
}
