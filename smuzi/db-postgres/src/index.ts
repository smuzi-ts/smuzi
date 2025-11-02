import { Pool, types } from 'pg'
import {preparedSqlFromObjectToArrayParams, TDatabaseClient} from "@smuzi/database";
import {dump, Err, isArray, isEmpty, match, None, Ok, Option, OptionFromNullable, Result, Some} from "@smuzi/std";
export * from "#lib/migrationsLogRepository.ts"
export * from "#lib/entityRepository.ts"

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
                    code: Some(err.code),
                    detail: Some(err.detail),
                    table: OptionFromNullable(err.table),
                });
            }
        }

    }
}



