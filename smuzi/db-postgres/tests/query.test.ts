import {assert, it} from "@smuzi/tests";
import {testRunner} from "./index.js";
import {dump, Some, StdRecord} from "@smuzi/std";
import {userSchema} from "./entities/User.js";

testRunner.describe("db-postgres - query", [
    it("SELECT rows without any typing", async (globalSetup) => {
        const result = (await globalSetup.unwrap().dbClient.query('SELECT * FROM users'))
            .unwrap(); // Possible query error

        const row = result
            .rows
            .get(0)
            .unwrap() // Possible empty element

        assert.isTrue(row instanceof StdRecord);
        assert.isNumber(row.get("id").unwrap());
        assert.isNumber(result.rowCount.unwrap());

    }),
    it("SELECT rows with Schema", async (globalSetup) => {
        const result = (await globalSetup.unwrap().dbClient.query('SELECT * FROM users', [], Some(userSchema)))
            .unwrap(); // Possible query error

        const row = result
            .rows
            .get(0)
            .unwrap() // Possible empty element

        assert.isNumber(row.id);
        assert.isString(row.name.unwrap());
        assert.datetime.isNative(row.created_at);
    })
])