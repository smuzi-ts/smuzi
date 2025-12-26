import {TestRunner} from "@smuzi/tests";
import {dump, env, main, Option, promiseAll, Some} from "@smuzi/std";
import usersTable from "./migrations/usersTable.js";
import {postgresClient} from "#lib/index.js";
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

export const testRunner = new TestRunner<GlobalSetup>({
    beforeGlobal: Some(async () => {
        const dbClient = buildClient();



        return Some({dbClient});
    }
    ),
    beforeEachCase: Some(async (globalSetup) => {
        const migrations = [
            usersTable,
        ].map(sql => globalSetup.unwrap().dbClient.query(sql));

        const migrateResult = (await promiseAll(migrations));
        migrateResult.unwrap();
    }),
    afterEachCase: Some(async (globalSetup) => {
//         (await globalSetup.unwrap().dbClient.query(
//             `DO $$ DECLARE
//     r RECORD;
// BEGIN
//     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
//         EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
//     END LOOP;
// END $$;`)).unwrap();
    }),
});

main(() => testRunner.run())
