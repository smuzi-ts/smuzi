import { Option, Result} from "@smuzi/std"

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

export type TQuery = <Entity = TRow> (sql: string, params?: Option<TParams>) => QueryResult<Entity>;
export type TQueryInsert = <Entity = TRow> (sql: string, params?: Option<TParams>) => QueryResult<Entity>;

export type TDatabaseClient = {
    query: TQuery,
    insertRow: TQuery
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