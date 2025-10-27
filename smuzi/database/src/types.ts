import {Option, Result} from "@smuzi/std"

type Primitive = number | string;
type Params = Primitive[] | Record<string, Primitive>
type Row = Record<string, unknown>

type QueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}

export type TQuery = <Entity = Row> (sql: string, params?: Option<Params>) => Promise<Result<Entity[], QueryError>>;

export type TDatabaseClient = {
    query: TQuery
}

export type TMigration = {
    up: () => string,
    down: () => string,
}

export type TMigrations = {
    add: (name: string, migration: TMigration) => void,
    getList: () => Map<string, TMigration>
}

export type TDatabaseConfig = {
    migrations: () => TMigrations,
    connections: Record<string, TDatabaseClient>,
    connection: TDatabaseClient
};