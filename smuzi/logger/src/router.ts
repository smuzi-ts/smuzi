import { Http1Router } from "@smuzi/http-server";
import { buildHttpClient, HttpClient } from "@smuzi/http-client";
import { logIdFromBody, logRetryAction, logsQueryAction } from "./actions.js";
import type { LogsReader } from "./reader.js";

export type LoggerRoutesOptions = {
    // Embedded in the route path: {prefix}/{token}/query; a wrong token simply gives 404
    token: string,
    // URL prefix the routes are mounted under, e.g. "logs" -> /logs/{token}/query
    prefix?: string,
    http_client?: HttpClient,
}

export const LOGGER_PATHS = {
    query: "query",
    retry: "retry",
} as const;

function normalizePrefix(prefix: string): string {
    return prefix.replace(/^\/+|\/+$/g, "");
}

export function registerLoggerHttp1Routes(
    router: Http1Router,
    reader: LogsReader,
    { token, prefix = "", http_client = buildHttpClient({}) }: LoggerRoutesOptions
): Http1Router {
    if (token === "") {
        throw new Error("Logger router token must not be empty");
    }

    const base = normalizePrefix(prefix);
    const withBase = (path: string) => [base, token, path].filter(part => part !== "").join("/");

    router.post(withBase(LOGGER_PATHS.query), logsQueryAction(reader));
    router.post(withBase(LOGGER_PATHS.retry), logRetryAction(reader, http_client, logIdFromBody));

    return router;
}
