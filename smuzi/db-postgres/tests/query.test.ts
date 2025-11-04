import {assert, describe, it, okMsg} from "@smuzi/tests";
import { postgresClient} from "#lib/index.js"
import {env, Option} from "@smuzi/std";
import {AutoId} from "@smuzi/database";
import {faker} from "@smuzi/faker";

describe("db-postgres - query - ", () => {
    it(okMsg("SELECT * FROM users"), async () => {

        const dbClient = postgresClient({
            host: env('DB_HOST'),
            port: Number(env('DB_PORT')),
            database: env('DB_DATABASE'),
            user: env('DB_USER'),
            password: env('DB_PASSWORD'),
        });

        (await dbClient.query(`CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
        )`)).unwrap();

        type TUserRow = {
            id: AutoId<Option<string>>,
            name: Option<string>,
            email: Option<string>,
            password: Option<string>,
            created_at: Option<Date>,
        }

        (await dbClient.insertRow<TUserRow>('users', {
            name: faker.string(),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.date(),
        })).unwrap();

        const result = (await dbClient.query<TUserRow[]>('SELECT id FROM users'));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                assert.isArray(rows);
                assert.isObject(rows[0]);
                assert.objectHasProperty(rows[0], 'name');
            },
        })
    })
})