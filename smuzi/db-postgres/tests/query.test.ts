import {assert, it} from "@smuzi/tests";
import {testRunner} from "./index.js";
import {Some, StdRecord} from "@smuzi/std";
import {userSchema} from "./entities/User.js";

testRunner.describe("db-postgres - query", [
    it("SELECT rows without any typing", async (globalSetup) => {
        const result = (await globalSetup.unwrap().dbClient.query('SELECT * FROM users'));

        const row = result
            .unwrap() // Possible query error
            .get(0)
            .unwrap() // Possible empty element

        assert.isTrue(row instanceof StdRecord);
        assert.isNotNullable(row.get("id"));

    }),
    it("SELECT rows with Schema", async (globalSetup) => {
        const result = (await globalSetup.unwrap().dbClient.query('SELECT * FROM users', [], Some(userSchema)));

        const row = result
            .unwrap() // Possible query error
            .get(0)
            .unwrap() // Possible empty element

        assert.isNumber(row.id);
        assert.isString(row.name.unwrap());
        assert.datetime.isNative(row.created_at);
    })
])