import {
    dump,
    None,
    Option,
    OptionFromNullable,
    RecordFromKeys,
    Result,
    Simplify,
    Some,
    StdList,
    StdRecord
} from "@smuzi/std"
import {
    SchemaObject,
    SchemaOption,
    SchemaRule,
    SchemaStorageAutoNumber,
} from "@smuzi/schema"

export type TQueryParams = unknown[] | Record<string, unknown>
export type TRow = Record<string, unknown>

export type TQueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}
export type TQueryResult<Row extends Record<string, unknown> | never, S extends SchemaObject> = Result<TableRows<Row, S>, TQueryError>
export type TInsertRowResult<S extends SchemaObject, Columns extends readonly (keyof S["__infer"])[]> = Result<Simplify<RecordFromKeys<S["__infer"], Columns>>, TQueryError>

export class TableRows<Row extends Record<string, unknown> | never, Schema extends SchemaObject, SchemaValue extends Option<Schema> = Option<never>, Rows extends Array<Record<string, unknown>> = Array<Record<string, unknown>>> {
    #rows: Rows
    #schema: SchemaValue

    constructor(schema: SchemaValue, rows: Rows) {
        this.#rows = rows;
        this.#schema = schema;
    }

    #prepareRow(row: Record<string, unknown>): SchemaValue extends Option<never> ?  StdRecord<Row> : Schema["__infer"] {
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

    get(key: number): Option<SchemaValue extends Option<never> ? StdRecord<Row> : Schema["__infer"]> {
        if (this.has(key)) {
            return Some(this.#prepareRow(this.#rows[key]));
        }

        return None();
    }

    has(key: number) {
        return key in this.#rows;
    }
}


export interface TDatabaseClient {
    query<Row extends Record<string, unknown> | never, S extends SchemaObject<any> | never = never>(sql: string, params?: TQueryParams, schema?: Option<S>): Promise<TQueryResult<Row, S>>;

    insertRow<S extends SchemaObject<any>, const RC extends string[],>(
        schema: S,
        table: string,
        row: TInsertRow<S>,
        returningColumns?: RC
    ): Promise<TInsertRowResult<S, RC>>;


    // insertManyRows: TInsertManyRowsMethod,
    // updateRow: TUpdateRowMethod,
    // updateManyRows:  <Entity = TRow>(table: string, values: TInsertRow<Entity>, where: string) => Promise<TQueryResult>,
}

export type TMigration = {
    up: () => string,
    down: () => string,
}

export type TMigrations = {
    add: (name: string, migration: TMigration) => void,
    group: (migrations: TMigrations) => void,
    getList: () => Map<string, TMigration>,
    getByName: (name: string) => TMigration,
    getGroupName:() => string
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


export enum TMigrationLogAction {
    up = 'up',
    down = 'down',
}

export type TMigrationLogSave = {
    name: Option<string>,
    branch: Option<number>,
    action: Option<TMigrationLogAction>,
    sql_source: Option<string>,
}

export type TMigrationLogRow = {
    id: Option<string>,
    name: Option<string>,
    branch: Option<number>,
    action: Option<string>,
    sql_source: Option<string>,
    created_at: Option<Date>,
}


export type TMigrationsLogRepository = {
    getTable(): string,
    createTableIfNotExists(): Promise<TQueryResult>,
    listRuned(): Promise<TQueryResult<TMigrationLogRow>>,
    listRunedByBranch(branch: number): Promise<TQueryResult<TMigrationLogRow>>,
    getLastBranch(): Promise<Option<number>>,
    create<RC extends string[] = ['id']>(row: TMigrationLogSave, returningColumns?: RC): Promise<TInsertRowResult<[], TMigrationLogSave>>,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): Promise<TQueryResult>
};

export type UnwrapOption<T> = T extends Option<infer U> ? U : T;

export type IsExcludeSaving<T> = T extends SchemaStorageAutoNumber ? true : false;

export type ExcludeExcludeSaveKeys<T> = {
    [K in keyof T]: IsExcludeSaving<T[K]> extends true ? never : K
}[keyof T];

// export type TInsertRow<T> = {
//     [K in ExcludeExcludeSaveKeys<T>]: UnwrapOption<T[K]>
// };


export type TInsertRow<S extends SchemaObject> = S extends SchemaObject<infer U> ? {
     [K in ExcludeExcludeSaveKeys<U>]: S["__infer"][K]
} : {};

