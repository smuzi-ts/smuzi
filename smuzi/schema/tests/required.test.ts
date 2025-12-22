import { assert, it } from "@smuzi/tests";
import { schema } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { None, Some, StdRecord, StdMap, dump } from "@smuzi/std";
import {testRunner} from "./index.js";


testRunner.describe("Std-Schema-Required", [
    it("Simple-Ok", () => {
        const schemaVal = schema.required(schema.string());
        assert.schema.selfCheckOk(schemaVal);
    }),
        it("Simple-Err", () => {
            const schemaVal = schema.required(schema.string());
            const input = faker.notString()

            schemaVal.validate(input)
                .match({
                    Ok() {
                        assert.fail("Expected error validation")
                    },
                    Err(err) {
                        assert.equal(err.msg, "Expected string");
                    }
                })
            }),

        it("Empty input", () => {
            const schemaVal = schema.required(schema.string());
            const input = faker.nullable()

            schemaVal.validate(input)
                .match({
                    Ok() {
                        assert.fail("Expected error validation")
                    },
                    Err(err) {
                        assert.equal(err.msg, "required");
                    }
                })
        }),


        it("In record-Ok", () => {
            const schemaVal = schema.record({
                name: schema.string(),
                title: schema.required(schema.string()),
            });

            assert.schema.selfCheckOk(schemaVal);
        }),

        it("In record-Empty", () => {
            const schemaVal = schema.record({
                name: schema.string(),
                title: schema.required(schema.string()),
            });

            const input = new StdRecord({
                name: faker.string(),
                title: faker.nullable(),
            })

            schemaVal.validate(input)
                .match({
                    Ok() {
                        assert.fail("Expected error validation")
                    },
                    Err(err) {
                        assert.equal(err.data.get("title").unwrapByKey("msg"), "required");
                    }
                })
        }),

        it("In map-Ok", () => {
            const schemaVal = schema.map(
                schema.string(),
                schema.required(schema.string())
            );

            assert.schema.selfCheckOk(schemaVal)
        }),

        it("In map-Empty", () => {
            const schemaVal = schema.map(
                schema.string(),
                schema.required(schema.string())
            );

            const input = new StdMap([
                ["1", faker.string()],
                ["2", faker.nullable() as any]
            ])
            schemaVal.validate(input)
                .match({
                    Ok() {
                        assert.fail("Expected error validation")
                    },
                    Err(err) {
                        assert.equal(err.data.get("2").unwrapByKey("msg"), "required");
                    }
                })
        }),
        it("In map with record-Empty", () => {
            const schemaVal = schema.map(
                schema.string(),
                schema.record({
                    name: schema.string(),
                    title: schema.required(schema.string()),
                })
            );

            const input = new StdMap([
                ["1", new StdRecord({
                    name: faker.string(),
                    title: faker.string(),
                })],
                ["2", new StdRecord({
                    name: faker.string(),
                    title: faker.nullable() as any,
                })]
            ])
            schemaVal.validate(input)
                .match({
                    Ok() {
                        assert.fail("Expected error validation")
                    },
                    Err(err) {
                        assert.equal(
                            err
                                .data.get("2")
                                .unwrapByKey("data")
                                .get("title")
                                .unwrapByKey("msg"),
                            "required"
                        );
                    }
                })
        }),
]
)