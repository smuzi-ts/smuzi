import { readFile } from "node:fs/promises";
import { ServerResponse } from "node:http";
import { Action, Context } from "@smuzi/http-server";
import { asObject, asString, HttpResponse, Option, ResponseHttpHeaders, Some } from "@smuzi/std";
import { LogsReader } from "@smuzi/logger";
import { HttpClient } from "@smuzi/http-client";
import { parseLogsQuery } from "./query.js";
import { LoggerUiAuth } from "./auth.js";

// Resolves to <package>/build/ui both from src/ (workspace) and from build/ (published).
const UI_DIR = new URL("../build/ui/", import.meta.url);

export enum UiAsset {
    script = "app.js",
    style = "app.css",
}

const ASSET_CONTENT_TYPES: Record<UiAsset, string> = {
    [UiAsset.script]: "text/javascript; charset=utf-8",
    [UiAsset.style]: "text/css; charset=utf-8",
};

function textResponse(body: string, content_type: string, status = 200): HttpResponse<string> {
    return new HttpResponse({
        status,
        body: Some(body),
        headers: new ResponseHttpHeaders([["content-type", content_type]]),
    });
}

async function readUiFile(file: string): Promise<string | null> {
    try {
        return await readFile(new URL(file, UI_DIR), "utf-8");
    } catch {
        return null;
    }
}

function assetsNotBuiltResponse(): HttpResponse<string> {
    return textResponse(
        "Logger UI assets are not built. Run: pnpm --filter @smuzi/logger-ui build:ui",
        "text/plain; charset=utf-8",
        503
    );
}

function escapeHtmlAttribute(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

async function htmlPageResponse(file: string, base_path: string): Promise<HttpResponse<string>> {
    const html = await readUiFile(file);
    if (html === null) {
        return assetsNotBuiltResponse();
    }

    return textResponse(
        html.replaceAll("{{base}}", escapeHtmlAttribute(base_path)),
        "text/html; charset=utf-8"
    );
}

function authErrorResponse(message: string) {
    return HttpResponse.asJson({ error: message }, 500);
}

// Runs the action only for a logged-in user; guests get `onGuest`.
function authenticated(
    auth: LoggerUiAuth,
    action: Action<ServerResponse>,
    onGuest: (context: Context<ServerResponse>) => ReturnType<Action<ServerResponse>>
): Action<ServerResponse> {
    return async (context) => {
        const user = await auth.authenticate(context.request);
        if (user.isErr()) {
            return authErrorResponse(user.unsafeSource().message);
        }

        return user.unwrap().isSome() ? action(context) : onGuest(context);
    };
}

export function uiPageAction(auth: LoggerUiAuth, base_path: string): Action<ServerResponse> {
    return authenticated(
        auth,
        () => htmlPageResponse("index.html", base_path),
        () => HttpResponse.asRedirect(base_path + "/login")
    );
}

export function loginPageAction(auth: LoggerUiAuth, base_path: string): Action<ServerResponse> {
    return authenticated(
        auth,
        () => HttpResponse.asRedirect(base_path === "" ? "/" : base_path),
        () => htmlPageResponse("login.html", base_path)
    );
}

export function loginAction(auth: LoggerUiAuth, base_path: string): Action<ServerResponse> {
    return async (context) => {
        const body = await context.request.body();
        if (body.isErr()) {
            return HttpResponse.asJson({ error: "Unable to read request body" }, 400);
        }

        let input: unknown;
        try {
            input = JSON.parse(body.unwrap());
        } catch {
            return HttpResponse.asJson({ error: "Request body must be valid JSON" }, 400);
        }

        if (!asObject(input) || !asString(input.email) || !asString(input.password)) {
            return HttpResponse.asJson({ error: "'email' and 'password' must be strings" }, 422);
        }

        const token = await auth.login(input.email, input.password);
        if (token.isErr()) {
            return authErrorResponse(token.unsafeSource().message);
        }

        return token.unwrap().match({
            Some: (value) => HttpResponse.asJson({ ok: true }).mapOk((response) => {
                response.headers.set("set-cookie", auth.sessionCookie(value, base_path));
                return response;
            }),
            None: () => HttpResponse.asJson({ error: "Invalid email or password" }, 401),
        });
    };
}

export function logoutAction(auth: LoggerUiAuth, base_path: string): Action<ServerResponse> {
    return () => HttpResponse.asJson({ ok: true }).mapOk((response) => {
        response.headers.set("set-cookie", auth.clearSessionCookie(base_path));
        return response;
    });
}

export function uiAssetAction(asset: UiAsset): Action<ServerResponse> {
    return async () => {
        const content = await readUiFile(asset);
        if (content === null) {
            return assetsNotBuiltResponse();
        }

        return textResponse(content, ASSET_CONTENT_TYPES[asset]);
    };
}

export function logsQueryAction(auth: LoggerUiAuth, reader: LogsReader): Action<ServerResponse> {
    return authenticated(auth, async (context) => {
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
    }, () => HttpResponse.asJson({ error: "Unauthorized" }, 401));
}

function pathParam(context: Context<ServerResponse>, name: string): Option<string> {
    return (context.pathParams as Option<Record<string, string>>).get(name);
}

export function logRetryAction(auth: LoggerUiAuth, reader: LogsReader, http_client: HttpClient): Action<ServerResponse> {
    return authenticated(auth, async (context) => {
        const id = Number(pathParam(context, "id").someOr(""));
        if (!Number.isInteger(id) || id <= 0) {
            return HttpResponse.asJson({ error: "Invalid log id" }, 400);
        }

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

        // Resends the original message as JSON; the http-client sets the correct
        // "application/json" content-type itself for an object body. Uses plain
        // fetch, so this goes out over HTTP/1 by default (no HTTP/2 dispatcher configured).
        const response = await http_client.post<string, string>(retry.url, {
            body: Some({ message: log.unwrap().message }),
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
    }, () => HttpResponse.asJson({ error: "Unauthorized" }, 401));
}
