import {assert, describe, it, okMsg} from "@smuzi/tests";
import {buildClient, globalSetup} from "./setup.js";
import {TUserRow} from "./entities/User.js";

describe("db-postgres - query", () => {
    it(okMsg("SELECT"), async () => {
        await globalSetup();

        const dbClient = buildClient();

        const result = (await dbClient.query<TUserRow[]>('SELECT id, name, email FROM users'));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                assert.isArray(rows);
                assert.isObject(rows[0]);
                assert.objectHasProperty(rows[0], 'id');
                assert.objectHasProperty(rows[0], 'name');
                assert.objectHasProperty(rows[0], 'email');
            },
        })
    })
})