import { env, Some } from "@smuzi/std";

export const LOGGER_MCP_NAME = "logger-mcp";
export const LOGGER_MCP_VERSION = "0.0.1";
export const LOGGER_MCP_DEFAULT_PORT = 8787;
export const LOGGER_MCP_TOKEN_MIN_LENGTH = 32;

export type LoggerMcpConfig = {
    // Static bearer token every request must carry: Authorization: Bearer <token>
    token: string,
    host: string,
    port: number,
    // Path the MCP endpoint is served on
    path: string,
}

export function loggerMcpConfigFromEnv(): LoggerMcpConfig {
    const token = env("LOGGER_MCP_TOKEN");
    if (token.length < LOGGER_MCP_TOKEN_MIN_LENGTH) {
        throw new Error(`LOGGER_MCP_TOKEN must be at least ${LOGGER_MCP_TOKEN_MIN_LENGTH} characters`);
    }

    return {
        token,
        // Loopback by default: expose it through a TLS reverse proxy or an SSH tunnel, never plain over the internet
        host: env("LOGGER_MCP_HOST", Some("127.0.0.1")),
        port: Number(env("LOGGER_MCP_PORT", Some(String(LOGGER_MCP_DEFAULT_PORT)))),
        path: "/" + env("LOGGER_MCP_PATH", Some("mcp")).replace(/^\/+|\/+$/g, ""),
    };
}
