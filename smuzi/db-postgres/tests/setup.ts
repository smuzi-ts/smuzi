import {postgresClient} from "#lib/index.js";
import {env, promiseAll} from "@smuzi/std";
import insertUsers from "./seeds/insertUsers.js";
import usersTable from "./migrations/usersTable.js";

const dbClient = buildClient();

export async function globalSetup() {

    const migrations = [
        usersTable,
    ]
        .map(sql => () => dbClient.query(sql));

    (await promiseAll(migrations)).unwrap();

    const seeds = [
        insertUsers,
    ]
        .map(seed => () => seed(dbClient));

    (await promiseAll(seeds)).unwrap();
}

export async function globalTeardown() {
    (await dbClient.query(
    `DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;`)).unwrap();

}

export function buildClient() {
    return postgresClient({
        host: env('DB_HOST'),
        port: Number(env('DB_PORT')),
        database: env('DB_DATABASE'),
        user: env('DB_USER'),
        password: env('DB_PASSWORD'),
    });
}