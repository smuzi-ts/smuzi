import {assert, it} from "@smuzi/tests";
import {testRunner} from "./index.js";
import {dump} from "@smuzi/std";
import {schema} from "@smuzi/schema";

testRunner.describe("db-postgres - query", [
    it("SELECT", async (globalSetup) => {
        const rowSchema = schema.record({
            count: schema.string()
        })

        type Row = typeof rowSchema.__infer;

        const result = (await globalSetup.unwrap().dbClient.query<Row>('SELECT count(*) FROM users'));

        const count =   result
            .unwrap() // Possible query error
            .get(0)
            .unwrap() // Possible empty element
            .get("count")
            .unwrap(); // Possible empty value

        assert.equal(count, "0")
    })
])