import {TestRunner} from "@smuzi/tests";
import {dump, env, main, Option, promise, scripts, Some} from "@smuzi/std";
import usersTableSql, {usersTable} from "./migrations/usersTable.js";
import logsTableSql, {logsTable} from "./migrations/logsTable.js";
import {postgresClient} from "@smuzi/db-postgres";
import {TDatabaseClient} from "@smuzi/database";

function buildClient() {
    return postgresClient({
        host: env('DB_HOST'),
        port: Number(env('DB_PORT')),
        database: env('DB_DATABASE'),
        user: env('DB_USER'),
        password: env('DB_PASSWORD'),
    });
}

export type GlobalSetup = Option<{
    dbClient: TDatabaseClient
}>

// Tables this suite creates and owns. Cleanup hooks below must never touch
// anything outside this list — whatever database DB_* points at may have
// other, unrelated tables that this suite has no business clearing or dropping.
const MANAGED_TABLES = [usersTable, logsTable] as const;

function truncateManagedTablesSql(): string {
    return `TRUNCATE TABLE ${MANAGED_TABLES.map(table => `public.${table}`).join(", ")};`;
}

export const testRunner = new TestRunner<GlobalSetup>({
    beforeGlobal: Some(async () => {
        const dbClient = buildClient();
            const migrations = [
                usersTableSql,
                logsTableSql,
            ].map(sql => dbClient.query(sql));

            const migrateResult = (await promise.all(migrations));
            migrateResult.unwrap();


        return Some({dbClient});
    }
    ),
    // Clears rows only from MANAGED_TABLES; it never drops tables and never
    // touches anything else in the schema.
    afterGlobal: Some(async (globalSetup) => {
        (await globalSetup.unwrap().dbClient.query(truncateManagedTablesSql())).unwrap();
    }),
    beforeEachCase: Some(async (globalSetup) => {
        dump(await scripts.runFromDir("./tests/seeds"))
    }),
    afterEachCase: Some(async (globalSetup) => {
        (await globalSetup.unwrap().dbClient.query(truncateManagedTablesSql())).unwrap();
    }),
});

main(() => testRunner.run())
