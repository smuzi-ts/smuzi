import {Option, Result} from "@smuzi/std"

export type TQueryParams = unknown[] | Record<string, unknown>
export type TRow = Record<string, Option>

export type QueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}

export type TQueryResult<Entity = unknown> = Result<Entity, QueryError>
export type TInsertRowResult<Entity = TRow> = Result<ExtractPrimaryKey<Entity>, QueryError>

export type TDatabaseClient = {
    query: <Entity = unknown>(sql: string, params?: TQueryParams) => Promise<TQueryResult<Entity>>,
    insertRow:  <Entity = TRow>(table: string, row: TInsertRow<Entity>, idColumn?: string) => Promise<TInsertRowResult<Entity>>,
    insertManyRows:  <Entity = TRow>(table: string, rows: TInsertRow<Entity>[], idColumn?: string) => Promise<TInsertRowResult<Entity>[]>,
    updateRow:  <Entity = TRow>(table: string, id: string|number, row: TInsertRow<Entity>, idColumn?: string) => Promise<TInsertRowResult<Entity>>,
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
    createTableIfNotExists(): Promise<TQueryResult>,
    listRuned(): Promise<TQueryResult<TMigrationLogRow>>,
    listRunedByBranch(branch: number): Promise<TQueryResult<TMigrationLogRow>>,
    getLastBranch(): Promise<Option<number>>,
    create(row: TMigrationLogSave): Promise<TInsertRowResult<TMigrationLogSave>>,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): Promise<TQueryResult>
};

export type ExcludeSaving<T> = T & { readonly __ExcludeSaving: unique symbol };
export type AutoId<T> = T & { readonly __PrimaryKey: unique symbol };

export type UnwrapOption<T> = T extends Option<infer U> ? U : T;

export type IsExcludeSaving<T> = T extends ExcludeSaving<infer U> | AutoId<infer U>
    ? (U extends Option ? true : false)
    : false;


export type ExcludeExcludeSaveKeys<T> = {
    [K in keyof T]: IsExcludeSaving<T[K]> extends true ? never : K
}[keyof T];

export type TInsertRow<T> = {
    [K in ExcludeExcludeSaveKeys<T>]: UnwrapOption<T[K]>
}

type ExtractPrimaryKey<T> = {
    [K in keyof T]: T[K] extends AutoId<infer U> ? U : Option
}[keyof T];