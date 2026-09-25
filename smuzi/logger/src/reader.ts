import { Option, Result, StdError } from "@smuzi/std";

export type LogTagFilter = {
    key: string,
    value: string,
}

export type LogsQuery = {
    trace_id?: string,
    // Substring match (case-insensitive) against a log's message; matches a group
    // if any of its logs contains it, same as a tag filter.
    message?: string,
    tags?: LogTagFilter[],
    limit?: number,
    offset?: number,
}

// Where a log's message gets resent when the user retries it from the UI.
export type RetryConfig = {
    url: string,
}

export type LogEntry = {
    id: number,
    trace_id: string | null,
    level: number,
    tags: Record<string, string | boolean | number>,
    message: string,
    stack_trace: string | null,
    retry: RetryConfig | null,
    retries_count: number,
    created_at: string,
}

export type LogGroup = {
    trace_id: string | null,
    level: number,
    started_at: string,
    finished_at: string,
    logs: LogEntry[],
}

export type LogGroupsPage = {
    total: number,
    limit: number,
    offset: number,
    groups: LogGroup[],
}

export const LOGS_QUERY_DEFAULT_LIMIT = 50;
export const LOGS_QUERY_MAX_LIMIT = 500;

// Only storages that can be queried implement it (Postgres); console output can't be read back.
export interface LogsReader {
    queryGroups(query: LogsQuery): Promise<Result<LogGroupsPage, StdError>>;
    getById(id: number): Promise<Result<Option<LogEntry>, StdError>>;
    incrementRetryCount(id: number): Promise<Result<number, StdError>>;
}
