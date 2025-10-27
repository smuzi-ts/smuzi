import {TDatabaseClient} from "#lib/types.ts";
import {isEmpty, None, Option, Some} from "@smuzi/std";

const table = 'migrations_log';

export enum TMigrationLogAction {
    up = 'up',
    down = 'down',
}

export type TMigrationLogSave = {
    name: string,
    branch: number,
    action: TMigrationLogAction,
    sql_source: string,
}

export type TMigrationLogRow = {
    id: Option<string>,
    name: Option<string>,
    branch: Option<number>,
    action: Option<string>,
    sql_source: Option<string>,
    created_at: Option<Date>,
}

export const buildMigrationsLogRepository = (client: TDatabaseClient) => {
    return {
        table,
        createTableIfNotExists()  {
            return client.query(`CREATE TABLE IF NOT EXISTS ${table} (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL ,
            branch INTEGER NOT NULL,
            action VARCHAR(20),
            sql_source TEXT  NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_branch_name_created ON ${table} (branch, name, created_at DESC);
`)
        },
        listRuned() {
            return client.query<TMigrationLogRow>(`SELECT * FROM ( SELECT DISTINCT ON (name) * FROM ${table} ORDER BY name, created_at DESC ) last_records WHERE action = '${TMigrationLogAction.up}'`);
        },
        listRunedByBranch(branch: number) {
            return client.query<TMigrationLogRow>(`SELECT * FROM ( SELECT DISTINCT ON (name) * FROM ${table} WHERE branch = ${branch} ORDER BY name, created_at DESC ) last_records WHERE action = '${TMigrationLogAction.up}'`);
        },
        async getLastBranch(): Promise<Option<number>> {
            const res = (await client.query(`SELECT MAX(branch) as last_branch FROM ${table}`)).unwrap();

            return isEmpty(res) || isEmpty(res[0]) || isEmpty(res[0].last_branch)
                ? None()
                : res[0].last_branch as Option<number>
        },
        create(row: TMigrationLogSave) {
            return client.query(`INSERT INTO ${table} (name, branch, action, sql_source) values($1,$2,$3,$4)`, Some([
                row.name,
                row.branch,
                row.action,
                row.sql_source,
            ]))
        },
        async migrationLastAction(name: string) {
            const res = (await client.query(`SELECT action FROM ${table} WHERE name = $1 ORDER BY created_at DESC LIMIT 1`, Some([name]))).unwrap();
            return isEmpty(res) || isEmpty(res[0]) || isEmpty(res[0].action)
                ? None()
                : res[0].action as Option<string>
        },
        async migrationWillBeRuned(name: string)
        {
            return (await this.migrationLastAction(name)).match({
                Some: (v) => v === TMigrationLogAction.up,
                None: () => false,
            })
        },
    }
}
