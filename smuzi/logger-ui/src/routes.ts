import { CreateHttp1Router, Http1Router } from "@smuzi/http-server";
import { LogsReader } from "@smuzi/logger";
import { buildHttpClient } from "@smuzi/http-client";
import {
    loginAction,
    loginPageAction,
    logoutAction,
    logRetryAction,
    logsQueryAction,
    UiAsset,
    uiAssetAction,
    uiPageAction,
} from "./handlers.js";
import { LoggerUiAuth } from "./auth.js";

export type LoggerUiRoutesOptions = {
    // URL prefix the UI is mounted under, e.g. "logs" -> /logs, /logs/api/logs
    prefix?: string,
}

export const LOGGER_UI_PATHS = {
    page: "",
    login_page: "login",
    script: "assets/" + UiAsset.script,
    style: "assets/" + UiAsset.style,
    query: "api/logs",
    retry: "api/logs/{id}/retry",
    login: "api/login",
    logout: "api/logout",
} as const;

function normalizePrefix(prefix: string): string {
    return prefix.replace(/^\/+|\/+$/g, "");
}

export function registerLoggerUiRoutes(
    router: Http1Router,
    reader: LogsReader,
    auth: LoggerUiAuth,
    { prefix = "" }: LoggerUiRoutesOptions = {}
): Http1Router {
    const base = normalizePrefix(prefix);
    const withBase = (path: string) => [base, path].filter(part => part !== "").join("/");
    const base_path = base === "" ? "" : "/" + base;
    const http_client = buildHttpClient({});

    router.get(withBase(LOGGER_UI_PATHS.page), uiPageAction(auth, base_path));
    router.get(withBase(LOGGER_UI_PATHS.login_page), loginPageAction(auth, base_path));
    router.get(withBase(LOGGER_UI_PATHS.script), uiAssetAction(UiAsset.script));
    router.get(withBase(LOGGER_UI_PATHS.style), uiAssetAction(UiAsset.style));
    router.post(withBase(LOGGER_UI_PATHS.query), logsQueryAction(auth, reader));
    router.post(withBase(LOGGER_UI_PATHS.retry), logRetryAction(auth, reader, http_client));
    router.post(withBase(LOGGER_UI_PATHS.login), loginAction(auth, base_path));
    router.post(withBase(LOGGER_UI_PATHS.logout), logoutAction(auth, base_path));

    return router;
}

export function createLoggerUiRouter(
    reader: LogsReader,
    auth: LoggerUiAuth,
    options: LoggerUiRoutesOptions = {}
): Http1Router {
    return registerLoggerUiRoutes(CreateHttp1Router({ path: "" }), reader, auth, options);
}
