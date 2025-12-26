import {assert, it} from "@smuzi/tests";
import {testRunner} from "./index.js";
import {dump, Some} from "@smuzi/std";
import {schema} from "@smuzi/schema";

testRunner.describe("db-postgres - query", [
    it("SELECT count", async (globalSetup) => {
        type CountRows = {
            count: string
        }

        const result = (await globalSetup.unwrap().dbClient.query<CountRows>('SELECT count(*) FROM users'));

        const row = result
            .unwrap() // Possible query error
            .get(0)
            .unwrap() // Possible empty element

        assert.equal(row.get("count").unwrap(), "0")
    })
])