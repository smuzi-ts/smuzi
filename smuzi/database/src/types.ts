import {
    None,
    Option,
    Result,
    Some, StdError,
    StdRecord
} from "@smuzi/std"
import {TMigrations, TMigrationsLogRepository} from "./migration.js";

export type TQueryParams = unknown[] | Record<string, unknown>

export class DBQueryError {
    readonly sql: string
    readonly message: string
    readonly code: Option<string>
    readonly detail: Option<string>
    readonly table: Option<string>
    readonly trace: string

    constructor(config: {sql: string, message: string, code: Option<string>, detail: Option<string>, table: Option<string>} ) {
        this.sql = config.sql;
        this.message = config.message;
        this.code = config.code;
        this.detail = config.detail;
        this.table = config.table;
        this.trace = new Error().stack as string;
    }

    toError(): StdError {
        return new StdError(
            this.message,
            Some(this.trace),
            Some({
                sql: this.sql,
                code: this.code,
                table: this.table,
                detail: this.detail,
            })
        )
    }
}

export type TQueryRawResult<Row extends Record<string, unknown> = Record<string, unknown>> = {
    rows: TableRows<Row>,
    rowCount: Option<number>
}
export type TQueryResult<Row extends Record<string, unknown> = Record<string, unknown>> = Result<TQueryRawResult<Row>, DBQueryError>
export type TInsertRowResult<Row extends Record<string, unknown>> = Result<Option<StdRecord<Row>>, DBQueryError>
export type TInsertManyRowResult<Row extends Record<string, unknown>> = Result<TableRows<Row>, DBQueryError>


export class TableRows<Row extends Record<string, unknown> = Record<string, unknown>> {
    #rows: Array<Record<string, unknown>>

    constructor(rows: Array<Record<string, unknown>>) {
        this.#rows = rows;
    }

    get(key: number): Option<StdRecord<Row>> {
        if (this.has(key)) {
            return Some(new StdRecord(this.#rows[key] as Row));
        }

        return None();
    }

    has(key: number) {
        return key in this.#rows;
    }

    *entries(): IterableIterator<[number, StdRecord<Row>]> {
        for (let k = 0; k < this.#rows.length; k++) {
            yield [k, this.get(k).unwrap()];
        }
    }

    [Symbol.iterator](): IterableIterator<[number, StdRecord<Row>]> {
        return this.entries();
    }

    unsafeSource() {
        return this.#rows;
    }
}


export interface TDatabaseClient {
    query<Row extends Record<string, unknown> = Record<string, unknown>>(
        sql: string,
        params?: TQueryParams
    ): Promise<TQueryResult<Row>>;

    insertRow<Insert extends Record<string, unknown>, Row extends Record<string, unknown> = Insert>(
        table: string,
        row: Insert,
        returningColumns?: readonly (keyof Row)[]
    ): Promise<TInsertRowResult<Row>>;

    insertManyRows<Insert extends Record<string, unknown>, Row extends Record<string, unknown> = Insert>(
        table: string,
        rows: Insert[],
        returningColumns?: readonly (keyof Row)[]
    ): Promise<TInsertManyRowResult<Row>>;

    updateRowById<Row extends Record<string, unknown>>(
        table: string,
        id: number | string,
        row: Partial<Row>,
        idColumn?: string
    ): Promise<TQueryResult<Row>>;

    updateManyRows<Row extends Record<string, unknown>>(table: string, values: Partial<Row>, where: string): Promise<TQueryResult<Row>>
}

export type TDatabaseService = {
    client: TDatabaseClient,
    buildMigrations: () => TMigrations,
    buildMigrationLogRepository:  (client: TDatabaseClient) => TMigrationsLogRepository,
}
