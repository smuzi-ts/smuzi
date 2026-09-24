import { Err, Ok, Result, StdError } from "@smuzi/std";
import {
    TDatabaseClient,
    TInsertRowResult,
} from "@smuzi/database";
import { type Logger, LogDetails, LogLevel } from "./index.js";
import {
    LogEntry,
    LogGroup,
    LogGroupsPage,
    LOGS_QUERY_DEFAULT_LIMIT,
    LOGS_QUERY_MAX_LIMIT,
    LogsQuery,
    LogsReader,
} from "./reader.js";

type SqlWithParams = {
    sql: string,
    params: unknown[],
}

type GroupKeyRow = {
    trace_id: string | null,
    single_id: number | null,
}

type LogRow = {
    id: number,
    trace_id: string | null,
    level: number,
    tags: Record<string, string | boolean | number> | null,
    message: string,
    created_at: Date | string,
}

function escapeLikePattern(value: string): string {
    return value.replace(/[\\%_]/g, "\\$&");
}

function clampInteger(value: number | undefined, fallback: number, min: number, max: number): number {
    if (value === undefined || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(Math.max(Math.trunc(value), min), max);
}

function groupKey(trace_id: string | null, id: number | null): string {
    return trace_id !== null ? "trace:" + trace_id : "log:" + id;
}

function toIsoString(value: Date | string): string {
    return value instanceof Date ? value.toISOString() : String(value);
}

// One group per trace_id; logs without trace_id become single-log groups.
// Tag filters are checked per group: every tag filter must match at least one log of the trace.
// Filters sharing the same key are OR'd together (e.g. route=orders OR route=users);
// filters on different keys are AND'd (e.g. route=orders AND status=500).
export function buildLogGroupsSql(table: string, query: LogsQuery): SqlWithParams {
    const params: unknown[] = [];
    const bind = (value: unknown) => {
        params.push(value);
        return "$" + params.length;
    };

    const where: string[] = [];
    const having: string[] = [];

    const trace_id = query.trace_id?.trim() ?? "";
    if (trace_id !== "") {
        where.push(`trace_id = ${bind(trace_id)}`);
    }

    const message = query.message?.trim() ?? "";
    if (message !== "") {
        having.push(`bool_or(message ILIKE ${bind("%" + escapeLikePattern(message) + "%")})`);
    }

    const values_by_key = new Map<string, string[]>();
    for (const tag of query.tags ?? []) {
        const key = tag.key.trim();
        if (key === "") {
            continue;
        }

        const values = values_by_key.get(key) ?? [];
        values.push(tag.value.trim());
        values_by_key.set(key, values);
    }

    for (const [key, values] of values_by_key) {
        const key_param = bind(key);
        const conditions = values.map(value => value === ""
            ? `tags ? ${key_param}`
            : `tags ->> ${key_param} ILIKE ${bind("%" + escapeLikePattern(value) + "%")}`
        );

        having.push(`bool_or(${conditions.join(" OR ")})`);
    }

    const sql = [
        `SELECT trace_id, CASE WHEN trace_id IS NULL THEN id END AS single_id, MAX(created_at) AS last_at`,
        `FROM ${table}`,
        where.length > 0 ? `WHERE ${where.join(" AND ")}` : "",
        `GROUP BY 1, 2`,
        having.length > 0 ? `HAVING ${having.join(" AND ")}` : "",
    ].filter(part => part !== "").join(" ");

    return { sql, params };
}

export class PostgresLogger implements Logger<TInsertRowResult<LogDetails>>, LogsReader {
    #dbClient: TDatabaseClient;
    #table: string;

    constructor(table: string, dbClient: TDatabaseClient) {
        this.#dbClient = dbClient;
        this.#table = table;
    }

    async #insert(log_details: LogDetails) {
        if (log_details.created_at == undefined) {
            log_details.created_at =Temporal.Now.instant();
        }
        return this.#dbClient.insertRow(this.#table, log_details);
    }

    async info(log_details: LogDetails) {
        log_details.level = LogLevel.info;

        return this.#insert(log_details);
    }

    async error(log_details: LogDetails) {
        log_details.level = LogLevel.error;

        return this.#insert(log_details);
    }

    async queryGroups(query: LogsQuery): Promise<Result<LogGroupsPage, StdError>> {
        const limit = clampInteger(query.limit, LOGS_QUERY_DEFAULT_LIMIT, 1, LOGS_QUERY_MAX_LIMIT);
        const offset = clampInteger(query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
        const groups_sql = buildLogGroupsSql(this.#table, query);

        const count_result = await this.#dbClient.query<{ total: string }>(
            `SELECT COUNT(*) AS total FROM (${groups_sql.sql}) AS matched`,
            groups_sql.params
        );
        if (count_result.isErr()) {
            return Err(count_result.unsafeSource().toError());
        }
        const total = Number(count_result.unwrap().rows.unsafeSource()[0]?.total ?? 0);

        const page_params = [...groups_sql.params, limit, offset];
        const page_result = await this.#dbClient.query<GroupKeyRow>(
            `${groups_sql.sql} ORDER BY last_at DESC, trace_id, single_id LIMIT $${page_params.length - 1} OFFSET $${page_params.length}`,
            page_params
        );
        if (page_result.isErr()) {
            return Err(page_result.unsafeSource().toError());
        }

        const group_keys = page_result.unwrap().rows.unsafeSource() as GroupKeyRow[];
        if (group_keys.length === 0) {
            return Ok({ total, limit, offset, groups: [] });
        }

        const trace_ids = group_keys.filter(row => row.trace_id !== null).map(row => row.trace_id);
        const single_ids = group_keys.filter(row => row.single_id !== null).map(row => row.single_id);

        const logs_result = await this.#dbClient.query<LogRow>(
            `SELECT id, trace_id, level, tags, message, created_at FROM ${this.#table}
             WHERE trace_id = ANY($1) OR id = ANY($2)
             ORDER BY created_at, id`,
            [trace_ids, single_ids]
        );
        if (logs_result.isErr()) {
            return Err(logs_result.unsafeSource().toError());
        }

        const groups = new Map<string, LogGroup>();
        for (const row of group_keys) {
            groups.set(groupKey(row.trace_id, row.single_id), {
                trace_id: row.trace_id,
                level: 0,
                started_at: "",
                finished_at: "",
                logs: [],
            });
        }

        for (const row of logs_result.unwrap().rows.unsafeSource() as LogRow[]) {
            const group = groups.get(groupKey(row.trace_id, row.trace_id === null ? row.id : null));
            if (group === undefined) {
                continue;
            }

            const entry: LogEntry = {
                id: row.id,
                trace_id: row.trace_id,
                level: row.level,
                tags: row.tags ?? {},
                message: row.message,
                created_at: toIsoString(row.created_at),
            };

            if (group.logs.length === 0) {
                group.started_at = entry.created_at;
            }
            group.finished_at = entry.created_at;
            group.level = Math.max(group.level, entry.level ?? 0);
            group.logs.push(entry);
        }

        return Ok({ total, limit, offset, groups: [...groups.values()] });
    }
}
