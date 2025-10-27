import {isEmpty, None, Option, Result, Some} from "@smuzi/std"

type Primitive = number | string;
type Params = Primitive[] | Record<string, Primitive>
type Row = Record<string, Option<unknown>>

export type QueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}

export type QueryResult<Entity = Row> = Promise<Result<Entity[], QueryError>>

export type TQuery = <Entity = Row> (sql: string, params?: Option<Params>) => QueryResult<Entity>;

export type TDatabaseClient = {
    query: TQuery
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
    create(row: TMigrationLogSave): QueryResult,
    migrationLastAction(name: string): Promise<Option<string>>,
    migrationWillBeRuned(name: string): Promise<boolean>,
    freshSchema(): QueryResult
};