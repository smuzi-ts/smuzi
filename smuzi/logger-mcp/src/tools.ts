import { asNumber, Err, HttpResponse, Ok, Result, Some, StdError } from "@smuzi/std";
import { buildHttpClient, HttpClient } from "@smuzi/http-client";
import { LogEntry, LogsReader, parseLogsQuery } from "@smuzi/logger";

const LOGS_LIMIT_MAX = 500;

export type ToolDefinition = {
    name: string,
    description: string,
    inputSchema: Record<string, unknown>,
}

export type ToolResult = {
    content: { type: "text", text: string }[],
    isError?: boolean,
}

export const LOGGER_MCP_TOOLS: ToolDefinition[] = [
    {
        name: "query_logs",
        description: "Search logs grouped by trace_id, newest first. All filters are optional and combined.",
        inputSchema: {
            type: "object",
            properties: {
                trace_id: { type: "string", description: "Exact trace id" },
                message: { type: "string", description: "Case-insensitive substring of a log message" },
                tags: {
                    type: "array",
                    description: "Tag filters; a group matches if any of its logs has the tag",
                    items: {
                        type: "object",
                        properties: {
                            key: { type: "string" },
                            value: { type: ["string", "number", "boolean"] },
                        },
                        required: ["key"],
                    },
                },
                limit: { type: "integer", minimum: 0, maximum: LOGS_LIMIT_MAX, description: "Page size, default 50" },
                offset: { type: "integer", minimum: 0, description: "Groups to skip" },
            },
        },
    },
    {
        name: "get_log",
        description: "Get a single log entry by id.",
        inputSchema: {
            type: "object",
            properties: { id: { type: "integer", minimum: 1, description: "Log entry id" } },
            required: ["id"],
        },
    },
    {
        name: "retry_log",
        description: "Resend a log's original message to its configured retry url (a real request from the server). Increments the log's retries_count.",
        inputSchema: {
            type: "object",
            properties: { id: { type: "integer", minimum: 1, description: "Log entry id" } },
            required: ["id"],
        },
    },
];

function toToolResult(result: Result<unknown, string>): ToolResult {
    return result.match({
        Ok: (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] }),
        Err: (message) => ({ isError: true, content: [{ type: "text", text: message }] }),
    });
}

function logId(args: Record<string, unknown>): Result<number, string> {
    return asNumber(args.id) && Number.isInteger(args.id) && args.id >= 1
        ? Ok(args.id)
        : Err("'id' must be a positive integer");
}

const errorMessage = (error: StdError) => error.message;

export class LoggerTools {
    constructor(
        private readonly reader: LogsReader,
        private readonly http_client: HttpClient = buildHttpClient({}),
    ) {}

    // Err means invalid arguments / unknown tool (a protocol error); failures of the tool itself are an Ok(isError) result.
    async call(name: string, args: Record<string, unknown>): Promise<Result<ToolResult, string>> {
        switch (name) {
            case "query_logs": {
                // Same validation as the logger's HTTP route, so both entry points accept identical input.
                const query = parseLogsQuery(JSON.stringify(args));
                if (query.isErr()) {
                    return Err(query.unsafeSource());
                }
                const page = await this.reader.queryGroups(query.unwrap());
                return Ok(toToolResult(page.mapErr(errorMessage)));
            }
            case "get_log": {
                const id = logId(args);
                if (id.isErr()) {
                    return Err(id.unsafeSource());
                }
                return Ok(toToolResult(await this.getLog(id.unwrap())));
            }
            case "retry_log": {
                const id = logId(args);
                if (id.isErr()) {
                    return Err(id.unsafeSource());
                }
                return Ok(toToolResult(await this.retryLog(id.unwrap())));
            }
            default:
                return Err(`Unknown tool: ${name}`);
        }
    }

    private async getLog(id: number): Promise<Result<LogEntry, string>> {
        const found = await this.reader.getById(id);
        if (found.isErr()) {
            return Err(found.unsafeSource().message);
        }
        const log = found.unwrap();
        return log.isNone() ? Err("Log not found") : Ok(log.unwrap());
    }

    private async retryLog(id: number): Promise<Result<unknown, string>> {
        const found = await this.getLog(id);
        if (found.isErr()) {
            return found;
        }

        const log = found.unwrap();
        if (log.retry === null) {
            return Err("Log has no retry configuration");
        }

        // Resends the original message as-is, same as the logger's HTTP retry route.
        const response = await this.http_client.post<string, string>(log.retry.url, {
            body: Some(log.message),
            rawResponse: true,
        });

        const retries_count = (await this.reader.incrementRetryCount(id)).okOr(log.retries_count);

        return Ok(response.match({
            Ok: (ok_response) => ({ status: ok_response.status, body: ok_response.body.someOr(""), retries_count }),
            Err: (error) => error instanceof HttpResponse
                ? { status: error.status, body: error.body.someOr(""), retries_count }
                : { error: "Retry request failed: " + String(error), retries_count },
        }));
    }
}
