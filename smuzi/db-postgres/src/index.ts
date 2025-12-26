import { Pool } from 'pg'
import {
    preparedSqlFromObjectToArrayParams, TableRows,
    TDatabaseClient, TInsertRow, TInsertRowResult, TQueryError,
    TQueryParams,
    TQueryResult, TRow
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

            return Ok(new TableRows(schema, res.rows))
        } catch (err) {
            return Err({
                sql: preparedSql.substring(0, 200) + (preparedSql.length > 200 ? " ..." : ""),
                message: err.message,
                code: OptionFromNullable(err.code),
                detail: OptionFromNullable(err.detail),
                table: OptionFromNullable(err.table),
            });
        }
    }

    async insertRow<S extends SchemaObject, const RC extends string[],>(
        schema: S,
        table: string,
        row: TInsertRow<S>,
        returningColumns: RC = Array<string>() as RC
    ): Promise<TInsertRowResult<S, RC>> {
        //TODO: protected for injections
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => isOption(val) ? val.someOr(null) : val);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returningColumns.join(',')}` ;

        return (await this.query(sql, values, Some(schema)))
            .errOr(rows => {
                return rows.get(0).match({
                    Some(row) {
                        return Ok(row) ;
                    },
                    None() {
                        return Err({
                            sql: sql,
                            message: 'Result of query insert row not contain any rows',
                            code: Some("SYSTEM:1000"),
                            detail: None(),
                            table: Some(table)
                        }) as Result<S['__infer'], TQueryError>
                    },
                })
        });
    }

    // async insertManyRows(table, rows, idColumn = 'id') {
    //     if (rows.length === 0) return Ok([]);
    //     //TODO: protected for injections
    //
    //     const columns = Object.keys(rows[0]);
    //     const values: any[] = [];
    //     const placeholders = rows.map((row, rowIndex) => {
    //         return `(${columns.map((_, colIndex) => {
    //             const placeholderIndex = rowIndex * columns.length + colIndex + 1;
    //             return `$${placeholderIndex}`;
    //         }).join(', ')})`;
    //     }).join(', ');
    //
    //     rows.forEach(row => values.push(...Object.values(row)));
    //
    //     return (await this.query<TRow[]>(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING ${idColumn}`, values))
    //         .mapOk(rows => rows.map(r => OptionFromNullable(r[idColumn])));
    // }

    // async updateRow(table, id, row, idColumn = 'id') {
    //     return this.updateManyRows(table, row, `${idColumn} = ${id}`)
    // }

    // async updateManyRows(table, values, where) {
    //     //TODO: protected for injections
    //     const entries = Object.entries(values);
    //
    //     const setClause = entries
    //         .map(([key], i) => `${key} = $${i + 1}`)
    //         .join(", ");
    //
    //     const sql = `UPDATE ${table} SET ${setClause} WHERE ${where};`;
    //
    //     const params = entries.map(([, val]) => val);
    //
    //     return (await this.query(sql, params)).mapOk(v);
    // }

}



export function postgresClient(config: Config): TDatabaseClient {
    return new PostgresClient(config);
}



