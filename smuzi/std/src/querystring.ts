import {Err, Ok, Result} from "#lib/result.js";
import {StdError, transformError} from "#lib/error.js";
import {asArray, asList, asMap, asNull, asRecord, asString, isEmpty} from "#lib/checker.js";
import {isNone} from "#lib/option.js";
import {StdRecord} from "#lib/record.js";
import {StdList} from "#lib/list.js";
import {dump} from "#lib/debug.js";
import { log } from "node:console";

export type QueryParams = Record<string, unknown>;

function toString(params: QueryParams): Result<string, StdError> {
    const pairs: string[] = [];

    for (const field in params) {
        if (params.hasOwnProperty(field)) {
            const value = params[field];

            if (asNull(value) || isNone(value)) {
                continue;
            }

            if (asList(value)) {
                for (const [key, item] of value) {
                    pairs.push(
                        encodeURIComponent(field) + '=' + encodeURIComponent(String(item.someOr('')))
                    );
                }
            } else if (asArray(value)) {
                for (const item of value) {
                    pairs.push(
                        encodeURIComponent(field) + '=' + encodeURIComponent(String(item))
                    );
                }
            }  else {
                pairs.push(
                    encodeURIComponent(field) + '=' + encodeURIComponent(String(value))
                );
            }
        }
    }

    return Ok(pairs.join('&'));
}

function fromString<T extends StdRecord<QueryParams>>(queryString: string): Result<T, StdError> {
    if (! asString(queryString)) {
        return Err(new StdError("queryString expected as string , but got " + typeof queryString));
    }

    const params: Record<string, any> = {};

    const str = queryString.startsWith('?')
        ? queryString.slice(1)
        : queryString;

    if (isEmpty(str)) {
        return Ok(new StdRecord as T);
    }

    const pairs = str.split('&');

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');

        if (key == null || key == '' || ! key) return;

        const decodedKey = decodeURIComponent(key);
        const decodedValue = value ? decodeURIComponent(value) : '';

        if (params.hasOwnProperty(decodedKey)) {
            const existing = params[decodedKey];
            if (asList(existing)) {
                existing.push(decodedValue);
            } else {
                params[decodedKey] = new StdList([existing, decodedValue]);
            }
        } else {
            params[decodedKey] = decodedValue;
        }

    });

    return Ok(new StdRecord(params) as T);
}

export const querystring = {
    fromString,
    toString,
}
