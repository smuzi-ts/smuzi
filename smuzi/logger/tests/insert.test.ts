import {assert, it} from "@smuzi/tests";
import {userSchema, usersTable} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {Some} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres-insert", [
    it("one row", async (globalSetup) => {
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
                    usersTable,
                    userSchema,
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


    }),

    it("many rows", async (globalSetup) => {
        const inserts = faker.repeat.asArray(3, () => ({
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        }));

        const result =
            (await globalSetup.unwrap()
                .dbClient
                .insertManyRows(
                    usersTable,
                    userSchema,
                    inserts,
                    ['id', 'name']
                ));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                const firstInsertRow = rows.get(0).unwrap();
                assert.isNumber(firstInsertRow.id);
                assert.isString(firstInsertRow.name.unwrap());
            },
        })
    }),
])