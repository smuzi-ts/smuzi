import { Pool } from 'pg'
import {
    preparedSqlFromObjectToArrayParams, TableRows,
    TDatabaseClient, TInsertManyRowResult, TInsertRowResult, DBQueryError,
    TQueryParams,
    TQueryResult
} from "@smuzi/database";
import {
    asArray,
    asObject,
    Err,
    isEmpty,
    isOption,
    Ok,
    OptionFromNullable,
} from "@smuzi/std";
export * from "./migrationsLogRepository.js"
export * from "./entityRepository.js"

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

    async query<Row extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: TQueryParams = []): Promise<TQueryResult<Row>> {
        let preparedSql = sql;
        let preparedParams: unknown[] = asArray(params) ? params : [];

        if (asObject(params)) {
            const preparedRes = preparedSqlFromObjectToArrayParams(preparedSql, params).unwrap();
            preparedSql = preparedRes.sql;
            preparedParams = preparedRes.params;
        }

        try {
            const res = await this.#pool.query({
                    text: preparedSql,
                    values: preparedParams,
                },
            );

            return Ok({
                rows: new TableRows<Row>(res.rows),
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

    async insertRow<Insert extends Record<string, unknown>, Row extends Record<string, unknown> = Insert>(
        table: string,
        row: Insert,
        returningColumns: readonly (keyof Row)[] = []
    ): Promise<TInsertRowResult<Row>> {
        //TODO: protected for injections
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => isOption(val) ? val.someOr(null) : val);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        let sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        if (!isEmpty(returningColumns)) sql += ` RETURNING ${returningColumns.join(',')}` ;

        return (await this.query<Row>(sql, values)).mapOk(res => res.rows.get(0));

    }

    async insertManyRows<Insert extends Record<string, unknown>, Row extends Record<string, unknown> = Insert>(
        table: string,
        rows: Insert[],
        returningColumns: readonly (keyof Row)[] = []
    ): Promise<TInsertManyRowResult<Row>> {
        if (rows.length === 0) return Ok(new TableRows([]));

        //TODO: protected for injections

        const columns = Object.keys(rows[0]);
        const values: unknown[] = [];
        const placeholders = rows.map((row, rowIndex) => {
            return `(${columns.map((_, colIndex) => {
                const placeholderIndex = rowIndex * columns.length + colIndex + 1;
                return `$${placeholderIndex}`;
            }).join(', ')})`;
        }).join(', ');

        rows.forEach(row => values.push(...Object.values(row).map(val => isOption(val) ? val.someOr(null) : val)));

        return (await this.query<Row>(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING ${returningColumns.join(',')}`, values)).mapOk(result => result.rows);
    }

    async updateRowById<Row extends Record<string, unknown>>(
        table: string,
        id: number | string,
        row: Partial<Row>,
        idColumn: string = 'id'
    ): Promise<TQueryResult<Row>>
    {
        //TODO: protected for injections
        return await this.updateManyRows<Row>(table, row, `${idColumn} = ${id}`);
    }

    async updateManyRows<Row extends Record<string, unknown>>(table: string, values: Partial<Row>, where: string): Promise<TQueryResult<Row>>
    {
        //TODO: protected for injections
        const entries = Object.entries(values);

        const setClause = entries
            .map(([key], i) => `${key} = $${i + 1}`)
            .join(", ");

        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where};`;

        const params = entries.map(([, val]) => val);

        return (await this.query<Row>(sql, params));
    }

}



export function postgresClient(config: Config): TDatabaseClient {
    return new PostgresClient(config);
}


