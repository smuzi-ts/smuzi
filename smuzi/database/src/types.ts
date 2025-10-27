import {Option, Result} from "@smuzi/std"

type Primitive = number | string;
type Params = Primitive[] | Record<string, Primitive>
type Row = Record<string, Option<unknown>>

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
    group: (migrations: TMigrations) => void,
    getList: () => Map<string, TMigration>,
    getByName: (name: string) => TMigration,
    getGroupName:() => string
}

export type TDatabaseService = {
    client: TDatabaseClient,
    migrations: () => TMigrations,
}

export type TDatabaseConfig = {
    services: Record<string, TDatabaseService>,
    current: TDatabaseService
};