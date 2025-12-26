import { Pool } from 'pg'
import {
    preparedSqlFromObjectToArrayParams, TableRows,
    TDatabaseClient, TInsertManyRowResult, TInsertRow, TInsertRowResult, DBQueryError,
    TQueryParams,
    TQueryResult
} from "@smuzi/database";
import {
    asArray,
    asObject, dump,
    Err,
    isArray, isOption,
    None,
    Ok, Option,
    OptionFromNullable,
    RecordFromKeys, Result,
    Simplify,
    Some, StdList, StdRecord
} from "@smuzi/std";
import {SchemaObject} from "@smuzi/schema";
export * from "#lib/migrationsLogRepository.js"
export * from "#lib/entityRepository.js"

export type Config = {
    user: string,
    password: string,
    host: string,
    port: number,
    database: string,
}




export class PostgresClient implements TDatabaseClient {
    readonly #pool: Pool;

    constructor(private readonly config: Config) {
         this.#pool = new Pool(config)

         this.#pool.on('error', (err, config) => {
            console.error('Unexpected error on idle client', err)
            process.exit(-1)
        })

    }

    async query<S extends SchemaObject>( sql: string, params: TQueryParams = [], schema: Option<S> = None()): Promise<TQueryResult<S>> {
        let preparedSql = sql;

        if (asObject(params)) {
            const preparedRes = preparedSqlFromObjectToArrayParams(preparedSql, params).unwrap();
            preparedSql = preparedRes.sql;
            params = preparedRes.params;
        }

        try {
            const res = await this.#pool.query({
                    text: preparedSql,
                    values: params,
                },
            );

            return Ok({
                rows: new TableRows(schema, res.rows),
                rowCount: OptionFromNullable(res.rowCount),
            })
        } catch (err) {
            return Err(new DBQueryError({
                sql: preparedSql.substring(0, 200) + (preparedSql.length > 200 ? " ..." : ""),
                message: err.message,
                code: OptionFromNullable(err.code),
                detail: OptionFromNullable(err.detail),
                table: OptionFromNullable(err.table),
            }));
        }
    }

    async insertRow<S extends SchemaObject<any>, const RC extends string[]>(
        table: string,
        schema: S,
        row: TInsertRow<S>,
        returningColumns: RC = Array<string>() as RC
    ): Promise<TInsertRowResult<S, RC>> {
        //TODO: protected for injections
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => isOption(val) ? val.someOr(null) : val);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returningColumns.join(',')}` ;

        return (await this.query(sql, values, Some(schema)))
            .errOr(result => {
                return result.rows.get(0).match({
                    Some(row) {
                        return Ok(row) as TInsertRowResult<S, RC>;
                    },
                    None() {
                        return Err(new DBQueryError(
                            {
                                sql,
                                message: 'Result of query insert row not contain any rows',
                                code: Some("SYSTEM:1000"),
                                detail: None(),
                                table: Some(table)
                            })
                        ) as TInsertRowResult<S, RC>
                    },
                })
        });
    }

    async insertManyRows<S extends SchemaObject<any>, const RC extends string[]>(
        table: string,
        schema: S,
        rows: TInsertRow<S>[],
        returningColumns: RC = Array<string>() as RC
    ): Promise<TInsertManyRowResult<S, RC>> {
        if (rows.length === 0) return Ok(new TableRows(Some(schema), [])) as any;

        //TODO: protected for injections

        const columns = Object.keys(rows[0]);
        const values: any[] = [];
        const placeholders = rows.map((row, rowIndex) => {
            return `(${columns.map((_, colIndex) => {
                const placeholderIndex = rowIndex * columns.length + colIndex + 1;
                return `$${placeholderIndex}`;
            }).join(', ')})`;
        }).join(', ');

        rows.forEach(row => values.push(...Object.values(row).map(val => isOption(val) ? val.someOr(null) : val)));

        return (await this.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING ${returningColumns.join(',')}`, values, Some(schema))).mapOk(result => result.rows) as any;
    }

    async updateRowById<S extends SchemaObject<any>>(
        table: string,
        schema: S,
        id: number | string,
        row: Partial<TInsertRow<S>>,
        idColumn: string = 'id'
    ): Promise<TQueryResult<S>>
    {
        //TODO: protected for injections
        return await this.updateManyRows(table, row, `${idColumn} = ${id}`);
    }

    async updateManyRows<S extends SchemaObject<any>>(table: string, values: Partial<TInsertRow<S>>, where): Promise<TQueryResult<S>>
    {
        //TODO: protected for injections
        const entries = Object.entries(values);

        const setClause = entries
            .map(([key], i) => `${key} = $${i + 1}`)
            .join(", ");

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where};`;

        const params = entries.map(([, val]) => val);

        return (await this.query(sql, params));
    }

}



export function postgresClient(config: Config): TDatabaseClient {
    return new PostgresClient(config);
}



