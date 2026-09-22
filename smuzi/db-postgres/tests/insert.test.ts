import {assert, it} from "@smuzi/tests";
import {UserInsert, UserRow, usersTable} from "./entities/User.js";
import {faker} from "@smuzi/faker";
import {Some} from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres-insert", [
    it("one row", async (globalSetup) => {
        const insert: UserInsert = {
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        };

        const result =
            (await globalSetup.unwrap()
                .dbClient
                .insertRow<UserInsert, UserRow>(
                    usersTable,
                    insert,
                    ['id', 'name']
                ));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (row) => {
                const user = row.unwrap();
                assert.isNumber(user.get('id').unwrap());
                assert.isString(user.get('name').unwrap());
            },
        })


    }),

    it("many rows", async (globalSetup) => {
        const inserts: UserInsert[] = faker.repeat.asArray(3, () => ({
            name: Some(faker.string()),
            email: faker.string(),
            password: faker.string(),
            created_at: faker.datetime.native(),
        }));

        const result =
            (await globalSetup.unwrap()
                .dbClient
                .insertManyRows<UserInsert, UserRow>(
                    usersTable,
                    inserts,
                    ['id', 'name']
                ));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                const firstInsertRow = rows.get(0).unwrap();
                assert.isNumber(firstInsertRow.get('id').unwrap());
                assert.isString(firstInsertRow.get('name').unwrap());
            },
        })
    }),
])