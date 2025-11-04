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
            const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

            return (await this.query(sql, values))
                .wrapOk(rows => OptionFromNullable(rows[0][idColumn]));
        }

    }
}



