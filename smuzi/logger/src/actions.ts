import { ServerResponse } from "node:http";
import { Action, Context } from "@smuzi/http-server";
import { asObject, asNumber, Err, HttpResponse, Ok, Option, Result, Some } from "@smuzi/std";
import { HttpClient } from "@smuzi/http-client";
import { parseLogsQuery } from "./query.js";
import type { LogsReader } from "./reader.js";

export type LogIdResolver = (context: Context<ServerResponse>) => Promise<Result<number, string>>;

function parseLogId(value: unknown): Result<number, string> {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? Ok(id) : Err("Invalid log id");
}

function pathParam(context: Context<ServerResponse>, name: string): Option<string> {
    return (context.pathParams as Option<Record<string, string>>).get(name);
}

// Log id from the `{id}` path parameter.
export const logIdFromPath: LogIdResolver = async (context) =>
    parseLogId(pathParam(context, "id").someOr(""));

// Log id from the JSON body: {"id": 1}.
export const logIdFromBody: LogIdResolver = async (context) => {
    const body = await context.request.body();
    if (body.isErr()) {
        return Err("Unable to read request body");
    }

    let input: unknown;
    try {
        input = JSON.parse(body.unwrap());
    } catch {
        return Err("Request body must be valid JSON");
    }

    if (!asObject(input) || !asNumber(input.id)) {
        return Err("'id' must be a number");
    }

    return parseLogId(input.id);
};

export function logsQueryAction(reader: LogsReader): Action<ServerResponse> {
    return async (context) => {
        const body = await context.request.body();
        if (body.isErr()) {
            return HttpResponse.asJson({ error: "Unable to read request body" }, 400);
        }

        const query = parseLogsQuery(body.unwrap());
        if (query.isErr()) {
            return HttpResponse.asJson({ error: query.unsafeSource() }, 422);
        }

        const page = await reader.queryGroups(query.unwrap());

        return page.match({
            Ok: (value) => HttpResponse.asJson(value),
            Err: (error) => HttpResponse.asJson({ error: error.message }, 500),
        });
    };
}

export function logRetryAction(
    reader: LogsReader,
    http_client: HttpClient,
    resolve_id: LogIdResolver
): Action<ServerResponse> {
    return async (context) => {
        const resolved = await resolve_id(context);
        if (resolved.isErr()) {
            return HttpResponse.asJson({ error: resolved.unsafeSource() }, 400);
        }
        const id = resolved.unwrap();

        const found = await reader.getById(id);
        if (found.isErr()) {
            return HttpResponse.asJson({ error: found.unsafeSource().message }, 500);
        }

        const log = found.unwrap();
        if (log.isNone()) {
            return HttpResponse.asJson({ error: "Log not found" }, 404);
        }

        const retry = log.unwrap().retry;
        if (retry === null) {
            return HttpResponse.asJson({ error: "Log has no retry configuration" }, 422);
        }

        // Resends the original message as-is (raw string body, no wrapping). Uses plain
        // fetch, so this goes out over HTTP/1 by default (no HTTP/2 dispatcher configured).
        const response = await http_client.post<string, string>(retry.url, {
            body: Some(log.unwrap().message),
            rawResponse: true,
        });

        const retries_count = await reader.incrementRetryCount(id);
        const retries_count_value = retries_count.okOr(log.unwrap().retries_count);

        return response.match({
            Ok: (ok_response) => HttpResponse.asJson({
                status: ok_response.status,
                body: ok_response.body.someOr(""),
                retries_count: retries_count_value,
            }),
            Err: (error) => error instanceof HttpResponse
                ? HttpResponse.asJson({
                    status: error.status,
                    body: error.body.someOr(""),
                    retries_count: retries_count_value,
                })
                : HttpResponse.asJson({ error: "Retry request failed: " + String(error) }, 502),
        });
    };
}
