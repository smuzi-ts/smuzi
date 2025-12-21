import {assert, it, okMsg} from "@smuzi/tests";
import {buildClient} from "./setup.js";
import {UserEntity} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {RecordFromKeys, StdRecord} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres - query", [
    it("insert row", async (globalSetup) => {
        const insert = new StdRecord({
            name: faker.string(),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        });

        const result = (await globalSetup.unwrap().dbClient.insertRow<UserEntity>('users', insert));

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
])