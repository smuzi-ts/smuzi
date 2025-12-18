import {assert, it} from "@smuzi/tests";
import {TUserRow} from "./entities/User.js";
import {testRunner} from "./index.js";

testRunner.describe("db-postgres - query", [
    it("SELECT", async (globalSetup) => {
        const result = (await globalSetup.unwrap().dbClient.query<TUserRow[]>('SELECT id, name, email FROM users'));

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
])