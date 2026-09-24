import { asArray, asNumber, asObject, asString, Err, Ok, Result } from "@smuzi/std";
import { LogsQuery, LogTagFilter } from "@smuzi/logger";

function parseOptionalInteger(value: unknown, field: string): Result<number | undefined, string> {
    if (value === undefined || value === null) {
        return Ok(undefined);
    }

    if (asNumber(value) && Number.isInteger(value) && value >= 0) {
        return Ok(value);
    }

    return Err(`'${field}' must be a non-negative integer`);
}

function parseTagFilter(value: unknown, index: number): Result<LogTagFilter, string> {
    if (!asObject(value) || !asString(value.key)) {
        return Err(`'tags[${index}].key' must be a string`);
    }

    const tag_value = value.value ?? "";
    if (!asString(tag_value) && !asNumber(tag_value) && typeof tag_value !== "boolean") {
        return Err(`'tags[${index}].value' must be a string, number or boolean`);
    }

    return Ok({ key: value.key, value: String(tag_value) });
}

export function parseLogsQuery(body: string): Result<LogsQuery, string> {
    if (body.trim() === "") {
        return Ok({});
    }

    let input: unknown;
    try {
        input = JSON.parse(body);
    } catch {
        return Err("Request body must be valid JSON");
    }

    if (!asObject(input) || asArray(input)) {
        return Err("Request body must be a JSON object");
    }

    const query: LogsQuery = {};

    if (input.trace_id !== undefined && input.trace_id !== null) {
        if (!asString(input.trace_id)) {
            return Err("'trace_id' must be a string");
        }
        query.trace_id = input.trace_id;
    }

    if (input.tags !== undefined && input.tags !== null) {
        if (!asArray(input.tags)) {
            return Err("'tags' must be an array of {key, value}");
        }

        const tags: LogTagFilter[] = [];
        for (const [index, tag] of input.tags.entries()) {
            const parsed = parseTagFilter(tag, index);
            if (parsed.isErr()) {
                return parsed;
            }
            tags.push(parsed.unwrap());
        }
        query.tags = tags;
    }

    for (const field of ["limit", "offset"] as const) {
        const parsed = parseOptionalInteger(input[field], field);
        if (parsed.isErr()) {
            return parsed;
        }
        const value = parsed.unwrap();
        if (value !== undefined) {
            query[field] = value;
        }
    }

    return Ok(query);
}
