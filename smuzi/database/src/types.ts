import {
    dump,
    None,
    Option,
    OptionFromNullable,
    RecordFromKeys,
    Result,
    Simplify,
    Some, StdError,
    StdList,
    StdRecord
} from "@smuzi/std"
import {
    schema,
    SchemaObject,
    SchemaOption,
    SchemaRule,
    SchemaStorageAutoNumber,
} from "@smuzi/schema"
import {TMigrations, TMigrationsLogRepository} from "#lib/migration.js";

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

export type TQueryRawResult<S extends SchemaObject> = {
    rows: TableRows<S>,
    rowCount: Option<number>
}
export type TQueryResult<S extends SchemaObject> = Result<TQueryRawResult<S>, DBQueryError>
export type TInsertRowResult<S extends SchemaObject, Columns extends readonly (keyof S["__infer"])[]> = Result<Simplify<RecordFromKeys<S["__infer"], Columns>>, DBQueryError>
export type TInsertManyRowResult<S extends SchemaObject, Columns extends readonly (keyof S["__infer"])[], Prepared extends SchemaObject = SchemaObject<RecordFromKeys<ReturnType<S["getConfig"]>, Columns>>> = Result<TableRows<Prepared>, DBQueryError>


export class TableRows<
    Schema extends SchemaObject,
    TableRow extends Option<Schema> extends Option<never> ? StdRecord<Record<string, unknown>> : Schema["__infer"] = Option<Schema> extends Option<never> ? StdRecord<Record<string, unknown>> : Schema["__infer"],
   Rows extends Array<Record<string, unknown>> = Array<Record<string, unknown>>
> {
    #rows: Rows
    #schema: Option<Schema>

    constructor(schema: Option<Schema>, rows: Rows) {
        this.#rows = rows;
        this.#schema = schema;
    }

    #prepareRow(row: Record<string, unknown>): TableRow {
        return this.#schema.match({
            None: () => new StdRecord(row),
            Some: (schema) => {

                const config = schema.getConfig();
                const prepare = {} as any;
                for (const field in config) {
                    /**
                     * TODO:
                     * A database is a sufficiently reliable data source
                     * to skip validating the retrieved data.
                     * However, it is important to understand that type inference in this case
                     * does not guarantee a 100% match with the actual database types.
                     * This especially affects working with nullable fields.
                     * For example, a field was required but later became nullable.
                     * In this case, without changing the schema, `null` values will start flowing into your code.
                     * This issue can be solved by `StdRecord`, but then all fields have to be handled as `Option`,
                     * which is very inconvenient for developers.
                    **/
                    if (field in row) {
                        if (config[field] instanceof SchemaOption) {
                            prepare[field] = OptionFromNullable(row[field]);
                        } else {
                            prepare[field] = row[field];
                        }
                    }
                }

                return prepare;
            }
        })

    }

    get(key: number): Option<TableRow> {
        if (this.has(key)) {
            return Some(this.#prepareRow(this.#rows[key]));
        }

        return None();
    }

    has(key: number) {
        return key in this.#rows;
    }

    *entries(): IterableIterator<[number, TableRow]> {
        for (let k = 0; k < this.#rows.length; k++) {
            yield [k, this.get(k).unwrap()];
        }
    }

    [Symbol.iterator](): IterableIterator<[number, TableRow]> {
        return this.entries();
    }
}


export interface TDatabaseClient {
    query<S extends SchemaObject<any>>(
        sql: string,
        params?: TQueryParams,
        schema?: Option<S>
    ): Promise<TQueryResult<S>>;

    insertRow<S extends SchemaObject<any>, const RC extends string[]>(
        table: string,
        schema: S,
        row: TInsertRow<S>,
        returningColumns?: RC
    ): Promise<TInsertRowResult<S, RC>>;

    insertManyRows<S extends SchemaObject<any>, const RC extends string[]>(
        table: string,
        schema: S,
        rows: TInsertRow<S>[],
        returningColumns?: RC
    ): Promise<TInsertManyRowResult<S, RC>>;

    updateRowById<S extends SchemaObject<any>>(
        table: string,
        schema: S,
        id: number | string,
        row: Partial<TInsertRow<S>>,
        idColumn?: string
    ): Promise<TQueryResult<S>>;

    updateManyRows<S extends SchemaObject<any>>(table: string, values: Partial<TInsertRow<S>>, where): Promise<TQueryResult<S>>

    // updateManyRows:  <Entity = TRow>(table: string, values: TInsertRow<Entity>, where: string) => Promise<TQueryResult>,
}

export type TDatabaseService = {
    client: TDatabaseClient,
    buildMigrations: () => TMigrations,
    buildMigrationLogRepository:  (client: TDatabaseClient) => TMigrationsLogRepository,
}

export type TDatabaseConfig = {
    services: Record<string, TDatabaseService>,
    current: TDatabaseService
};


export type IsExcludeSaving<T> = T extends SchemaStorageAutoNumber ? true : false;

export type ExcludeExcludeSaveKeys<T> = {
    [K in keyof T]: IsExcludeSaving<T[K]> extends true ? never : K
}[keyof T];

export type TInsertRow<S extends SchemaObject> = S extends SchemaObject<infer U> ? {
     [K in ExcludeExcludeSaveKeys<U>]: S["__infer"][K]
} : {};

