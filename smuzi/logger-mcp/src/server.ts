import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { LoggerMcpConfig } from "./config.js";
import { handleMcpMessage, JSON_RPC_ERROR, jsonRpcError } from "./protocol.js";
import { LoggerTools } from "./tools.js";

const MAX_BODY_BYTES = 1024 * 1024;

function isAuthorized(request: IncomingMessage, token: string): boolean {
    const header = request.headers.authorization ?? "";
    const provided = Buffer.from(header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "");
    const expected = Buffer.from(token);

    return provided.length === expected.length && timingSafeEqual(provided, expected);
}

async function readBody(request: IncomingMessage): Promise<string | null> {
    const chunks: Buffer[] = [];
    let size = 0;

    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
            return null;
        }
        chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString("utf8");
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
}

// MCP "Streamable HTTP" transport, JSON-response flavor: each POST carries one JSON-RPC message.
export function createLoggerMcpServer(tools: LoggerTools, config: LoggerMcpConfig): Server {
    return createServer(async (request, response) => {
        if (new URL(request.url ?? "/", "http://localhost").pathname !== config.path) {
            sendJson(response, 404, { error: "Not found" });
            return;
        }

        // Checked before anything else, so unauthenticated callers learn nothing about the endpoint.
        if (!isAuthorized(request, config.token)) {
            response.setHeader("www-authenticate", "Bearer");
            sendJson(response, 401, { error: "Unauthorized" });
            return;
        }

        if (request.method !== "POST") {
            // No server-initiated stream is offered (GET) and there are no sessions to close (DELETE).
            response.setHeader("allow", "POST");
            sendJson(response, 405, { error: "Method not allowed" });
            return;
        }

        const raw = await readBody(request);
        if (raw === null) {
            sendJson(response, 413, jsonRpcError(null, JSON_RPC_ERROR.invalid_request, "Request body too large"));
            return;
        }

        let message: unknown;
        try {
            message = JSON.parse(raw);
        } catch {
            sendJson(response, 400, jsonRpcError(null, JSON_RPC_ERROR.parse, "Parse error"));
            return;
        }

        try {
            const reply = await handleMcpMessage(tools, message);
            if (reply === null) {
                response.writeHead(202).end();
                return;
            }
            sendJson(response, 200, reply);
        } catch (error) {
            console.error("logger-mcp: unhandled error", error);
            sendJson(response, 500, jsonRpcError(null, -32603, "Internal error"));
        }
    });
}
