import { assert, it } from "@smuzi/tests";
import { schema } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { None, Some, StdRecord, StdMap, dump } from "@smuzi/std";
import {testRunner} from "./index.js";


testRunner.describe("Std-Schema-Option", [
    it("Simple-Ok", () => {
        const schemaVal = schema.option(schema.string());
        const input = Some(faker.string());
        const validate = schemaVal.validate(input);
        assert.result.equalOk(validate);
    }),
]
)