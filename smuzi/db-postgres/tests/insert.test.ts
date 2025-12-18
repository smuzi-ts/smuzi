import {assert, describe, it, okMsg, before, after} from "@smuzi/tests";
import {buildClient, globalSetup, globalTeardown} from "./setup.js";
import {TUserRow} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {RecordFromKeys, Simplify} from "@smuzi/std";

describe("db-postgres - query", () => {

    it(okMsg("INSERT ROW"), async () => {
        const dbClient = buildClient();

        function test<const C extends readonly string[]>(
            columns: C
        ): RecordFromKeys<C, TUserRow> {
            return {} as any;
        }

        const res1 = test(['name', 'email']);

        const result = (await dbClient.insertRow<TUserRow>('users', {
            name: faker.string(),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.date(),
        }, ['name']));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (row) => {

            },
        })



    })

    // it(okMsg("SELECT"), async () => {
    //     const dbClient = buildClient();
    //
    //     const result = (await dbClient.query<TUserRow[]>('SELECT id, name, email FROM users'));
    //
    //     result.match({
    //         Err: (error) => assert.fail(error.message),
    //         Ok: (rows) => {
    //             assert.isArray(rows);
    //             assert.isObject(rows[0]);
    //             assert.object.hasProperty(rows[0], 'id');
    //             assert.object.hasProperty(rows[0], 'name');
    //             assert.object.hasProperty(rows[0], 'email');
    //         },
    //     })
    // })
})