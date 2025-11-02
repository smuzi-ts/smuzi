import {keysOfObject, Option, Result} from "@smuzi/std"

export type TPrimitive = number | string;
export type TParams = TPrimitive[] | Record<string, TPrimitive>
export type TRow = Record<string, Option>

export type QueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}

export type QueryResult<Entity = TRow> = Promise<Result<Entity[], QueryError>>
export type TQueryMethod = <Entity = TRow> (sql: string, params?: TParams) => QueryResult<Entity>;
export type TInsertRowResult<Entity = TRow> = Promise<Result<ExtractPrimaryKey<Entity>, QueryError>>
export type TInsertRowMethod = <Entity = TRow> (table: string, row: TInsertRow<Entity>, idColumn?: string) => TInsertRowResult<Entity>;

export type TDatabaseClient = {
    query: TQueryMethod,
    insertRow: TInsertRowMethod,
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
    name: string,
    branch: number,
    action: TMigrationLogAction,
    sql_source: string,
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
    createTableIfNotExists(): QueryResult,
    listRuned(): QueryResult<TMigrationLogRow>,
    listRunedByBranch(branch: number): QueryResult<TMigrationLogRow>,
    getLastBranch(): Promise<Option<number>>,
    create(row: TMigrationLogSave): QueryResult<Option>,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): QueryResult
};

export type ExcludeSaving<T> = T & { readonly __ExcludeSaving: unique symbol };
export type PrimaryKey<T> = T & { readonly __PrimaryKey: unique symbol };

export type UnwrapOption<T> = T extends Option<infer U> ? U : T;

export type IsExcludeSaving<T> = T extends ExcludeSaving<infer U> | PrimaryKey<infer U>
    ? (U extends Option<any> ? true : false)
    : false;


export type ExcludeExcludeSaveKeys<T> = {
    [K in keyof T]: IsExcludeSaving<T[K]> extends true ? never : K
}[keyof T];

export type TInsertRow<T> = {
    [K in ExcludeExcludeSaveKeys<T>]: UnwrapOption<T[K]>
}

type ExtractPrimaryKey<T> = {
    [K in keyof T]: T[K] extends PrimaryKey<infer U> ? U : Option
}[keyof T];