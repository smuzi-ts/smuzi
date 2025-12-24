import { Pool } from 'pg'
import {
    preparedSqlFromObjectToArrayParams,
    TDatabaseClient, TInsertRow, TInsertRowResult, TQueryError,
    TQueryMethod,
    TQueryParams,
    TQueryResult, TRow
} from "@smuzi/database";
import {
    asArray,
    asObject, dump,
    Err,
    isArray,
    None,
    Ok, Option,
    OptionFromNullable,
    RecordFromKeys,
    Simplify,
    Some, StdList, StdRecord
} from "@smuzi/std";
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

    async query<T extends StdRecord<Record<string, unknown>>>(sql: string, params?: TQueryParams): Promise<TQueryResult<T>> {
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
            return Ok(new StdList(res.rows))
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

    async insertRow(tableSchema, row, returningColumns) {
        //TODO: protected for injections
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returningColumns.join(',')}` ;

        return (await this.query(sql, values))
            .errOr(rows => {
                return rows.get(0).match({
                    Some: row => Ok(row),
                    None: () => {
                        Err({
                            sql: sql,
                            message: 'Result of query insert row not contain any rows',
                            code: Some("SYSTEM:1000"),
                            detail: None(),
                            table: Some(table)
                        })
                    }
                })
        });
    }

    async insertManyRows(table, rows, idColumn = 'id') {
        if (rows.length === 0) return Ok([]);
        //TODO: protected for injections

        const columns = Object.keys(rows[0]);
        const values: any[] = [];
        const placeholders = rows.map((row, rowIndex) => {
            return `(${columns.map((_, colIndex) => {
                const placeholderIndex = rowIndex * columns.length + colIndex + 1;
                return `$${placeholderIndex}`;
            }).join(', ')})`;
        }).join(', ');

        rows.forEach(row => values.push(...Object.values(row)));

        return (await this.query<TRow[]>(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING ${idColumn}`, values))
            .mapOk(rows => rows.map(r => OptionFromNullable(r[idColumn])));
    }

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



