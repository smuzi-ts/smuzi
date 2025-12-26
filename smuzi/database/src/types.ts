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
    schema,
    SchemaObject,
    SchemaOption,
    SchemaRule,
    SchemaStorageAutoNumber,
} from "@smuzi/schema"
import {TMigrations, TMigrationsLogRepository} from "#lib/migration.js";

export type TQueryParams = unknown[] | Record<string, unknown>
export type TRow = Record<string, unknown>

export type TQueryError = {
    message: string
    code: Option<string>
    detail: Option<string>
    table: Option<string>
}
export type TQueryResult<S extends SchemaObject> = Result<TableRows<S, Option<S>>, TQueryError>
export type TInsertRowResult<S extends SchemaObject, Columns extends readonly (keyof S["__infer"])[]> = Result<Simplify<RecordFromKeys<S["__infer"], Columns>>, TQueryError>


export class TableRows<
    Schema extends SchemaObject,
    SchemaValue extends Option<Schema>,
    TableRow extends SchemaValue extends Option<never> ? StdRecord<Record<string, unknown>> : Schema["__infer"] = SchemaValue extends Option<never> ? StdRecord<Record<string, unknown>> : Schema["__infer"],
   Rows extends Array<Record<string, unknown>> = Array<Record<string, unknown>>
> {
    #rows: Rows
    #schema: SchemaValue

    constructor(schema: SchemaValue, rows: Rows) {
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
    query<S extends SchemaObject<any>>(sql: string, params?: TQueryParams, schema?: Option<S>): Promise<TQueryResult<S>>;

    insertRow<S extends SchemaObject<any>, const RC extends string[]>(
        table: string,
        schema: S,
        row: TInsertRow<S>,
        returningColumns?: RC
    ): Promise<TInsertRowResult<S, RC>>;


    // insertManyRows: TInsertManyRowsMethod,
    // updateRow: TUpdateRowMethod,
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

