import { Pool } from 'pg'
import {preparedSqlFromObjectToArrayParams, TDatabaseClient} from "@smuzi/database";
import { Err, isArray, Ok, OptionFromNullable} from "@smuzi/std";
export * from "#lib/migrationsLogRepository.js"
export * from "#lib/entityRepository.js"

export type Config = {
    user: string,
    password: string,
    host: string,
    port: number,
    database: string,
}

export function postgresClient(config: Config): TDatabaseClient {
    const pool = new Pool(config)

    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
    })

    return {
        async query(sql, params = []) {

            let preparedSql = sql;

            if (!isArray(params)) {
                const preparedRes = preparedSqlFromObjectToArrayParams(preparedSql, params).unwrap();
                preparedSql = preparedRes.sql;
                params = preparedRes.params;
            }

            try {
                const res = await pool.query({
                        text: preparedSql,
                        values: params,
                        types: {
                            getTypeParser: () => val => OptionFromNullable(val)
                        },
                    },
                );

                return Ok(res.rows)
            } catch (err) {
                return Err({
                    sql: preparedSql.substring(0, 200) + (preparedSql.length > 200 ? " ..." : ""),
                    message: err.message,
                    code: OptionFromNullable(err.code),
                    detail: OptionFromNullable(err.detail),
                    table: OptionFromNullable(err.table),
                });
            }
        },

        async insertRow(table, row, idColumn = 'id') {
            //TODO: protected for injections
            const columns = Object.keys(row);
            const values = Object.values(row);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${idColumn}` ;

            return (await this.query(sql, values))
                .wrapOk(rows => OptionFromNullable(rows[0][idColumn]));
        },

        async insertManyRows(table, rows, idColumn = 'id') {
            if (rows.length === 0) return Ok([]);

            const columns = Object.keys(rows[0]);
            const values: any[] = [];
            const placeholders = rows.map((row, rowIndex) => {
                return `(${columns.map((_, colIndex) => {
                    const placeholderIndex = rowIndex * columns.length + colIndex + 1;
                    return `$${placeholderIndex}`;
                }).join(', ')})`;
            }).join(', ');

            rows.forEach(row => values.push(...Object.values(row)));

            return (await this.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} RETURNING ${idColumn}`, values))
                .wrapOk(rows => rows.map(r => OptionFromNullable(r[idColumn])));
        },


    }
}



