import {TestRunner} from "@smuzi/tests";
import {dump, env, main, Option, promise, scripts, Some} from "@smuzi/std";
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
            const migrations = [
                usersTable,
            ].map(sql => dbClient.query(sql));

            const migrateResult = (await promise.all(migrations));
            migrateResult.unwrap();


        return Some({dbClient});
    }
    ),
    afterGlobal: Some(async (globalSetup) => {
       (await globalSetup.unwrap().dbClient.query(
            `DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;`)).unwrap();
    }),
    beforeEachCase: Some(async (globalSetup) => {
        dump(await scripts.runFromDir("./tests/seeds"))
    }),
    afterEachCase: Some(async (globalSetup) => {
        (await globalSetup.unwrap().dbClient.query(
            `DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || '';
    END LOOP;
END $$;`)).unwrap();
    }),
});

main(() => testRunner.run())
