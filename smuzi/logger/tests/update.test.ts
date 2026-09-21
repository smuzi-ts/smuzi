import {assert, it} from "@smuzi/tests";
import {userSchema, usersTable} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {dump, Some, StdError} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres-update", [
    it("one row", async (globalSetup) => {
        const insert = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const resultInsert =
            (await globalSetup.unwrap()
                .dbClient
                .insertRow(
                    usersTable,
                    userSchema,
                    insert,
                    ['id', 'name']
                ));

        const insertId = resultInsert.unwrap().id;

        const update = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const resultUpdate =
            (await globalSetup.unwrap()
                .dbClient
                .updateRowById(
                    usersTable,
                    userSchema,
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