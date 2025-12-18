import {Option, RecordFromKeys, Result, Simplify} from "@smuzi/std"

export type TQueryParams = unknown[] | Record<string, unknown>
export type TRow = Record<string, Option>

export type TQueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}

export type TQueryResult<Entity = unknown> = Result<Entity, TQueryError>
export type TInsertRowResult<Columns extends readonly string[], Entity extends TRow> = Result<Simplify<RecordFromKeys<Columns, Entity>>, TQueryError>

export type TQueryMethod<Entity = unknown> = (sql: string, params?: TQueryParams) => Promise<TQueryResult<Entity>>;
// export type TInsertMethod<Entity = TRow>= (table: string, row: TInsertRow<Entity>, idColumn?: string) => Promise<TInsertRowResult<Entity>>
// export type TInsertManyRowsMethod = <Entity = TRow>(table: string, rows: TInsertRow<Entity>[], idColumn?: string) => Promise<TInsertRowResult<Entity>[]>;
// export type TUpdateRowMethod = <Entity = TRow>(table: string, id: string|number, row: TInsertRow<Entity>, idColumn?: string) => Promise<TQueryResult>

export interface TDatabaseClient {
    query<Entity = unknown>(sql: string, params?: TQueryParams): Promise<TQueryResult<Entity>>;
    insertRow<Entity extends TRow, RC extends string[]>(table: string, row: TInsertRow<Entity>, returningColumns: RC): Promise<TInsertRowResult<RC, Entity>>;
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

export type ExtractPrimaryKey<T> = {
    [K in keyof T]: T[K] extends AutoId<infer U> ? U : Option
}[keyof T];