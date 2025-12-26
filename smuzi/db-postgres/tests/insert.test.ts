import {assert, it} from "@smuzi/tests";
import {userSchema, usersTable} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {dump, None, RecordFromKeys, Some, StdRecord} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres - query", [
    it("insert row", async (globalSetup) => {
        const insert = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const result =
            (await globalSetup.unwrap()
                .dbClient
                .insertRow(
                    userSchema,
                    usersTable,
                    insert,
                    ['id', 'name']
                ));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (row) => {
                assert.isNumber(row.id);
                assert.isString(row.name.unwrap());
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