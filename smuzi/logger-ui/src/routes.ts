import { CreateHttp1Router, Http1Router } from "@smuzi/http-server";
import { LogsReader } from "@smuzi/logger";
import { logsQueryAction, UiAsset, uiAssetAction, uiPageAction } from "./handlers.js";

export type LoggerUiRoutesOptions = {
    // URL prefix the UI is mounted under, e.g. "logs" -> /logs, /logs/api/logs
    prefix?: string,
}

export const LOGGER_UI_PATHS = {
    page: "",
    script: "assets/" + UiAsset.script,
    style: "assets/" + UiAsset.style,
    query: "api/logs",
} as const;

function normalizePrefix(prefix: string): string {
    return prefix.replace(/^\/+|\/+$/g, "");
}

export function registerLoggerUiRoutes(
    router: Http1Router,
    reader: LogsReader,
    { prefix = "" }: LoggerUiRoutesOptions = {}
): Http1Router {
    const base = normalizePrefix(prefix);
    const withBase = (path: string) => [base, path].filter(part => part !== "").join("/");
    const base_path = base === "" ? "" : "/" + base;

    router.get(withBase(LOGGER_UI_PATHS.page), uiPageAction(base_path));
    router.get(withBase(LOGGER_UI_PATHS.script), uiAssetAction(UiAsset.script));
    router.get(withBase(LOGGER_UI_PATHS.style), uiAssetAction(UiAsset.style));
    router.post(withBase(LOGGER_UI_PATHS.query), logsQueryAction(reader));

    return router;
}

export function createLoggerUiRouter(reader: LogsReader, options: LoggerUiRoutesOptions = {}): Http1Router {
    return registerLoggerUiRoutes(CreateHttp1Router({ path: "" }), reader, options);
}
