import {Err, Ok, Result} from "#lib/result.js";
import {StdError, transformError} from "#lib/error.js";
import {asArray, asMap, asNull, asRecord, asString, isEmpty} from "#lib/checker.js";
import {isNone} from "#lib/option.js";
import {StdRecord} from "#lib/record.js";

export type QueryParams = Record<string, unknown>;

function toString(params: QueryParams): Result<string, StdError> {
    const pairs: string[] = [];

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];

            if (asNull(value) || isNone(value)) {
                continue;
            }

            if (asArray(value)) {
                value.forEach((item) => {
                    pairs.push(
                        encodeURIComponent(key) + '=' + encodeURIComponent(String(item))
                    );
                });
            } else {
                pairs.push(
                    encodeURIComponent(key) + '=' + encodeURIComponent(String(value))
                );
            }
        }
    }

    return Ok(pairs.join('&'));
}

function fromString<T extends QueryParams>(queryString: string): Result<StdRecord<T>, StdError> {
    if (! asString(queryString)) {
        return Err(new StdError("queryString expected as string , but got " + typeof queryString));
    }

    const params: Record<string, string | string[]> = {};

    const str = queryString.startsWith('?')
        ? queryString.slice(1)
        : queryString;

    if (isEmpty(str)) {
        return Ok(new StdRecord);
    }

    const pairs = str.split('&');

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');

        if (!key) return;

        const decodedKey = decodeURIComponent(key);
        const decodedValue = value ? decodeURIComponent(value) : '';

        // Если ключ уже существует, создаём массив
        if (params.hasOwnProperty(decodedKey)) {
            const existing = params[decodedKey];
            if (Array.isArray(existing)) {
                existing.push(decodedValue);
            } else {
                params[decodedKey] = [existing, decodedValue];
            }
        } else {
            params[decodedKey] = decodedValue;
        }
    });

    return Ok(new StdRecord(params as T));
}

export const querystring = {
    fromString,
    toString,
}
