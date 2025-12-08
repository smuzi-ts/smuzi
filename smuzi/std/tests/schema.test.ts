import {assert, describe, it} from "@smuzi/tests";
import {schema} from "#lib/schema.js";
import {faker} from "@smuzi/faker";
import {None, Some} from "#lib/option.js";
import {StdRecord} from "#lib/record.js";


export default describe("Std-Schema", [
        it("Number-Ok", () => {
            const schemaVal = schema.number();
            assert.result.equalOk(schemaVal.validate(faker.number()))
        }),
        it("Number-Err", () => {
            const schemaVal = schema.number();
            schemaVal.validate(faker.string()).match({
                Ok() {
                    assert.fail("Expected error validation")
                },
                Err(err) {
                    assert.equal(err.msg, "Expected number");
                }
            })        }),
        it("String-Ok", () => {
            const schemaVal = schema.string();
            assert.result.equalOk(schemaVal.validate(faker.string()))
        }),
        it("String-Err", () => {
            const schemaVal = schema.string();
            const validation = schemaVal.validate(faker.number());
            validation.match({
                Ok() {
                    assert.fail("Expected error validation")
                },
                Err(err) {
                    assert.equal(err.msg, "Expected string");
                }
            })
        }),
    it("String-Err-Custom Msg", () => {
        const schemaVal = schema.string("my custom message");
        const validation = schemaVal.validate(faker.number());
        validation.match({
            Ok() {
                assert.fail("Expected error validation")
            },
            Err(err) {
                assert.equal(err.msg, "my custom message");
            }
        })
    }),
        it("Object-Ok", () => {
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

    it("Object-Err", () => {
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
    it("Object-missing field", () => {
        const schemaVal = schema.obj({
            id: schema.number(),
            name: schema.string()
        });

        const user = {
            id: faker.number(), //Not Number
            //missing name
        };
        schemaVal.validate(user).match({
            Ok() {
                assert.fail("Expected error validation")
            },
            Err(err) {
                assert.deepEqual(err.data.get("id"), None());
                assert.deepEqual(err.data.get("name").unwrap().msg, "required");
            }
        })
    }),
    it("Record-Ok", () => {
        const schemaVal = schema.record({
            id: schema.number(),
            name: schema.string()
        });

        const input = new StdRecord({
            id: faker.number(),
            name: faker.string()
        })

        const validate = schemaVal.validate(input);

        assert.result.equalOk(validate)
    }),
    it("Record-missing field", () => {
        const schemaVal = schema.record({
            id: schema.number(),
            name: schema.string()
        });

        const input = new StdRecord({
            id: faker.number(),
            //missing name
        })

        schemaVal.validate(input)
            .match({
            Ok() {
                assert.fail("Expected error validation")
            },
            Err(err) {
                assert.deepEqual(err.data.get("id"), None());
                assert.deepEqual(err.data.get("name").unwrap().msg, "required");
            }
        })
    }),
    it("Map-Ok", () => {
        const schemaVal = schema.map({
            id: schema.number(),
            name: schema.string()
        });

        const input = new StdRecord({
            id: faker.number(),
            name: faker.string()
        })

        const validate = schemaVal.validate(input);

        assert.result.equalOk(validate)
    }),
    ]
)