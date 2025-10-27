import { Pool, types } from 'pg'
import {preparedSqlFromObjectToArrayParams, TDatabaseClient} from "@smuzi/database";
import {Err, isArray, isEmpty, match, None, Ok, Option, OptionFromNullable, Result, Some} from "@smuzi/std";
export * from "#lib/migrationsLogRepository.ts"
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

    return  {
        async query(sql, params = None()) {
            let preparedSql = sql;
            let preparedParams = params.someOr([]);

            if (! isArray(preparedParams)) {
                const preparedRes = preparedSqlFromObjectToArrayParams(preparedSql, preparedParams).unwrap();
                preparedSql = preparedRes.sql;
                preparedParams = preparedRes.params;
            }

            try {
                const res = await pool.query({
                        text: preparedSql,
                        values: preparedParams,
                        types: {
                            getTypeParser: () => val => OptionFromNullable(val)
                        },
                    },
                );

                return Ok(res.rows)
            } catch (err) {
                return Err({
                    message: err.message,
                    code: Some(err.code),
                    detail: Some(err.detail),
                    table: OptionFromNullable(err.table),
                });
            }
        }
    }
}



