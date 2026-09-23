import { Migration, Migrations } from "@smuzi/database";

export const postgresMigrations = (table: string = 'logs') => {
    const migrations = Migrations('smuzi:logger:');
    migrations.add('create_'+table, Migration(
        {
            up: () =>  (`
            CREATE TABLE IF NOT EXISTS ${table} (
                id SERIAL PRIMARY KEY,
                level SMALLINT,
                tags JSONB,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );`
            ),

            down: () => `DROP TABLE IF EXISTS ${table};`
        }))

    return migrations;
}