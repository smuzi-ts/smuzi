import { assert, it } from "@smuzi/tests";
import { schema } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { None, Some, StdRecord, StdMap, dump } from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("Std-Object", [
        it("Ok", () => {
            const schemaVal = schema.obj({
                id: schema.number(),
                name: schema.string()
            });

            const validate = schemaVal.validate({
                id: faker.number(),
                name: faker.string()
            });

            assert.result.equalOk(validate)
        }),

        it("Err", () => {
            const schemaVal = schema.obj({
                id: schema.number(),
                name: schema.string()
            });

            const user = {
                id: faker.string(), //Not Number
                name: faker.number() //Not String
            };

            const validation = schemaVal.validate(user)
            validation.match({
                Ok() {
                    assert.fail("Expected error validation")
                },
                Err(err) {
                    assert.deepEqual(err.data.get("id").unwrap().msg, "Expected number");
                    assert.deepEqual(err.data.get("name").unwrap().msg, "Expected string");
                }
            })
        }),
        it("empty field-Ok", () => {
            const schemaVal = schema.obj({
                id: schema.number(),
                name: schema.option(schema.string()),
            });

            const user = {
                id: faker.number(),
            };
            assert.result.equalOk(schemaVal.validate(user));

        }),

]
)