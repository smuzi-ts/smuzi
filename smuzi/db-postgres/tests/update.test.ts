import {assert, it} from "@smuzi/tests";
import {UserInsert, UserRow, usersTable} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {dump, Some, StdError} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres-update", [
    it("one row", async (globalSetup) => {
        const insert: UserInsert = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const resultInsert =
            (await globalSetup.unwrap()
                .dbClient
                .insertRow<UserInsert, UserRow>(
                    usersTable,
                    insert,
                    ['id', 'name']
                ));

        const insertId = resultInsert.unwrap().unwrap().get('id').unwrap();

        const update: Partial<UserRow> = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const resultUpdate =
            (await globalSetup.unwrap()
                .dbClient
                .updateRowById<UserRow>(
                    usersTable,
                    insertId,
                    update,
                ));


        resultUpdate.match({
            Err: (error) => assert.fail(error.toError()),
            Ok: (res) => {
                assert.equal(res.rowCount.unwrap(), 1)
            },
        })


    })
])