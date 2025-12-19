import { assert, it } from "@smuzi/tests";
import { schema } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { None, Some, StdRecord, StdMap, dump } from "@smuzi/std";
import {testRunner} from "./index.js";


testRunner.describe("Std-Schema-Date", [
    it("Native-Ok", () => {
        const schemaVal = schema.date.native();
        assert.result.equalOk(schemaVal.validate(faker.date()))
    }),
    // it("Number-Err", () => {
    //     const schemaVal = schema.number();
    //     schemaVal.validate(faker.string()).match({
    //         Ok() {
    //             assert.fail("Expected error validation")
    //         },
    //         Err(err) {
    //             assert.equal(err.msg, "Expected number");
    //         }
    //     })
    // }),
]
)