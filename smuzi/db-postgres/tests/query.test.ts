import {assert, describe, it, okMsg, before, after} from "@smuzi/tests";
import {buildClient, globalSetup, globalTeardown} from "./setup.js";
import {TUserRow} from "./entities/User.js";

describe("db-postgres - query", () => {
    before(globalSetup);
    after(globalTeardown);

    it(okMsg("SELECT"), async () => {
        const dbClient = buildClient();

        const result = (await dbClient.query<TUserRow[]>('SELECT id, name, email FROM users'));

        result.match({
            Err: (error) => assert.fail(error.message),
            Ok: (rows) => {
                assert.isArray(rows);
                assert.isObject(rows[0]);
                assert.object.hasProperty(rows[0], 'id');
                assert.object.hasProperty(rows[0], 'name');
                assert.object.hasProperty(rows[0], 'email');
            },
        })
    })
})