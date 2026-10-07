import { asArray, asObject, asString } from "@smuzi/std";
import { LOGGER_MCP_NAME, LOGGER_MCP_VERSION } from "./config.js";
import { LOGGER_MCP_TOOLS, LoggerTools } from "./tools.js";

const PROTOCOL_VERSION = "2025-03-26";

export const JSON_RPC_ERROR = {
    parse: -32700,
    invalid_request: -32600,
    method_not_found: -32601,
    invalid_params: -32602,
} as const;

export type JsonRpcReply =
    | { jsonrpc: "2.0", id: string | number | null, result: unknown }
    | { jsonrpc: "2.0", id: string | number | null, error: { code: number, message: string } };

export function jsonRpcError(id: string | number | null, code: number, message: string): JsonRpcReply {
    return { jsonrpc: "2.0", id, error: { code, message } };
}

// Transport-agnostic: takes one parsed JSON-RPC message, returns the reply, or null for notifications.
export async function handleMcpMessage(tools: LoggerTools, message: unknown): Promise<JsonRpcReply | null> {
    if (!asObject(message) || asArray(message) || !asString(message.method)) {
        return jsonRpcError(null, JSON_RPC_ERROR.invalid_request, "Invalid request");
    }

    // Notifications (no id), e.g. notifications/initialized, get no reply.
    if (message.id === undefined) {
        return null;
    }

    const id = message.id as string | number | null;
    const params = asObject(message.params) ? message.params as Record<string, unknown> : {};

    switch (message.method) {
        case "initialize":
            return {
                jsonrpc: "2.0", id, result: {
                    protocolVersion: PROTOCOL_VERSION,
                    capabilities: { tools: {} },
                    serverInfo: { name: LOGGER_MCP_NAME, version: LOGGER_MCP_VERSION },
                },
            };
        case "ping":
            return { jsonrpc: "2.0", id, result: {} };
        case "tools/list":
            return { jsonrpc: "2.0", id, result: { tools: LOGGER_MCP_TOOLS } };
        case "tools/call": {
            if (!asString(params.name)) {
                return jsonRpcError(id, JSON_RPC_ERROR.invalid_params, "'name' must be a string");
            }
            const args = asObject(params.arguments) && !asArray(params.arguments)
                ? params.arguments as Record<string, unknown>
                : {};

            const called = await tools.call(params.name, args);
            return called.match({
                Ok: (result) => ({ jsonrpc: "2.0" as const, id, result }),
                Err: (error_message) => jsonRpcError(id, JSON_RPC_ERROR.invalid_params, error_message),
            });
        }
        default:
            return jsonRpcError(id, JSON_RPC_ERROR.method_not_found, `Method not found: ${message.method}`);
    }
}
