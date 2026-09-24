import { buildHttp1ServerConfig, http1ServerRun } from "@smuzi/http-server";
import { LogsReader } from "@smuzi/logger";
import { createLoggerUiRouter, LoggerUiRoutesOptions } from "./routes.js";

export const LOGGER_UI_DEFAULT_PORT = 8090;

export type LoggerUiServerOptions = LoggerUiRoutesOptions & {
    host?: string,
    port?: number,
}

export function buildLoggerUiServerConfig(
    reader: LogsReader,
    { host = "localhost", port = LOGGER_UI_DEFAULT_PORT, prefix }: LoggerUiServerOptions = {}
) {
    return buildHttp1ServerConfig({
        host,
        port,
        router: createLoggerUiRouter(reader, { prefix }),
    });
}

export function runLoggerUi(reader: LogsReader, options: LoggerUiServerOptions = {}) {
    return http1ServerRun(buildLoggerUiServerConfig(reader, options));
}
