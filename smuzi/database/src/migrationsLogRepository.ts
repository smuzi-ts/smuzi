import {TDatabaseClient} from "#lib/types.ts";
import {isEmpty, None, Option, Some} from "@smuzi/std";

const table = 'migrations_log';

export type TMigrationLogCreate = {
    name: string,
    branch: number,
    action: string,
    sql_source: string,
}

export type TMigrationLogRow = TMigrationLogCreate & {
    id: string,
    created_at: Date
}


export const buildMigrationsLogRepository = (client: TDatabaseClient) => {
    return {
        table,
        createTableIfNotExists()  {
            return client.query(`CREATE TABLE IF NOT EXISTS ${table} (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL ,
            branch INTEGER NOT NULL,
            action VARCHAR(20),
            sql_source TEXT  NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`)
        },
        all() {
            return client.query<TMigrationLogRow>("SELECT * FROM ${table}");
        },
        async getLastBranch(): Promise<Option<number>> {
            const res = (await client.query(`SELECT MAX(branch) as last_branch FROM ${table}`)).unwrap();

            return isEmpty(res) || isEmpty(res[0]) || isEmpty(res[0].last_branch)
                ? None()
                : Some(res[0].last_branch as number)
        },
        create(row: TMigrationLogCreate) {
            return client.query(`INSERT INTO ${table} (name, branch, action, sql_source) values($1,$2,$3,$4)`, Some([
                row.name,
                row.branch,
                row.action,
                row.sql_source,
            ]))
        },
        async migrationWillBeRuned(name: string)
        {
            const res = (await client.query(`SELECT action FROM ${table} WHERE name = $1 ORDER BY created_at DESC LIMIT 1`, Some([name]))).unwrap();
            return ! (isEmpty(res) || isEmpty(res[0]) || isEmpty(res[0].action !== 'up'))
        }
    }
}
