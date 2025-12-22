import { assert, it } from "@smuzi/tests";
import { schema } from "#lib/index.js";
import { faker } from "@smuzi/faker";
import { None, Some, StdRecord, StdMap, dump } from "@smuzi/std";
import {testRunner} from "./index.js";

testRunner.describe("Std-Schema", [
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
        })
    }),

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
    it("Object-empty field-Ok", () => {
        const schemaVal = schema.obj({
            id: schema.number(),
            name: schema.string()
        });

        const user = {
            id: faker.number(),
        };
        assert.result.equalOk(schemaVal.validate(user));

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
    it("Record-empty field-Ok", () => {
        const schemaVal = schema.record({
            id: schema.number(),
            name: schema.string()
        });

        const input = new StdRecord({
            id: faker.number(),
        })

        assert.result.equalOk(schemaVal.validate(input));
    }),
    it("Map-Ok", () => {
        const schemaVal = schema.map(schema.number(),
            schema.record({
            id: schema.number(),
            name: schema.string()
        }));

        const oneRecordInput = new StdRecord({
            id: faker.number(),
            name: faker.string()
        });

        const input = new StdMap([[0, oneRecordInput]])

        assert.result.equalOk(schemaVal.validate(input))
    }),
    it("Map-Err", () => {
        const schemaVal = schema.map(schema.number(),
            schema.record({
                id: schema.number(),
                name: schema.string()
            }));

        const oneRecordInput = new StdRecord({
            id: faker.notNumber(),
            name: faker.notString(),
        });

        const input = new StdMap([[0, oneRecordInput]])

        schemaVal.validate(input).match({
            Ok(ok) {
                assert.fail("Expected Err but get Ok")
            },
            Err(err) {
                const firstElementValidation = err.data.get(0).unwrap().data;

                const firstIdValidation = firstElementValidation.get("id").unwrap();
                assert.equal(firstIdValidation.msg, "Expected number")
                assert.isTrue(firstIdValidation.data instanceof StdRecord)

                const firstNameValidation = firstElementValidation.get("name").unwrap();
                assert.equal(firstNameValidation.msg, "Expected string")
                assert.isTrue(firstIdValidation.data instanceof StdRecord)
            }
        })
    }),
        it("Map-invalid keys", () => {
            const schemaVal = schema.map(schema.string(),
                schema.record({
                    id: schema.number(),
                    name: schema.string()
                }));

            const oneRecordInput = new StdRecord({
                id: faker.number(),
                name: faker.string(),
            });

            const input = new StdMap([[0, oneRecordInput], [1, oneRecordInput]])

            schemaVal.validate(input).match({
                Ok(ok) {
                    assert.fail("Expected Err but get Ok")
                },
                Err(err) {
                    assert.equal(err.data.get(0).unwrap().msg, "Invalid key: Expected string");
                    assert.equal(err.data.get(1).unwrap().msg, "Invalid key: Expected string");

                }
            })
        }),
    it("Record with Map-Ok", () => {
        const postSchema = schema.record({
            id: schema.number(),
        });

        const userSchema = schema.record({
            userName: schema.string(),
            posts: schema.map(schema.number(), postSchema),
        });

        type Post = typeof postSchema.__infer;
        type User = typeof userSchema.__infer;

        const postsInput = faker.repeat.asMap(5, () => {
            return new StdRecord({
                id: faker.number(),
            });
        })

        const userInput = new StdRecord({
            userName: faker.string(),
            posts: postsInput,
        });

        const validation = userSchema.validate(userInput);

        assert.result.equalOk(validation);
    }),
    it("Record with Map-Ok", () => {
        const postSchema = schema.record({
            id: schema.number(),
        });

        const userSchema = schema.record({
            userName: schema.string(),
            posts: schema.map(schema.number(), postSchema),
        });

        type Post = typeof postSchema.__infer;
        type User = typeof userSchema.__infer;

        const postsInput = faker.repeat.asMap(3, () => {
            return new StdRecord({
                id: faker.number(),
            });
        })

        const userInput = new StdRecord({
            userName: faker.string(),
            posts: postsInput,
        });

        const validation = userSchema.validate(userInput);

        assert.result.equalOk(validation);
    }),

    it("Record with Map-Err", () => {
        const postSchema = schema.record({
            id: schema.number(),
        });

        const userSchema = schema.record({
            userName: schema.string(),
            posts: schema.map(schema.number(), postSchema),
        });

        type Post = typeof postSchema.__infer;
        type User = typeof userSchema.__infer;

        const postsInput = faker.repeat.asMap(3, () => {
            return new StdRecord({
                id: faker.notNumber(),
            });
        })

        const userInput = new StdRecord({
            userName: faker.string(),
            posts: postsInput,
        });


        userSchema.validate(userInput).match({
            Ok(ok) {
                assert.fail("Expected Err but get Ok")
            },
            Err(err) {
                const postsErrors = err.data.get("posts").unwrapByKey("data");

                for(const [key, err] of postsErrors) {
                    const errData = err.unwrapByKey("data");
                    assert.equal(errData.get("id").unwrapByKey("msg"), "Expected number")
                }
            }
        })
    }),
        it("Record with List-Ok", () => {
            const postSchema = schema.record({
                id: schema.number(),
            });

            const userSchema = schema.record({
                userName: schema.string(),
                posts: schema.list(postSchema),
            });

            const postsInput = faker.repeat.asList(3, () => {
                return new StdRecord({
                    id: faker.number(),
                });
            })

            const userInput = new StdRecord({
                userName: faker.string(),
                posts: postsInput,
            });

            const validation = userSchema.validate(userInput);

            assert.result.equalOk(validation);
        }),
        it("Record with List-Err", () => {
            const postSchema = schema.record({
                id: schema.number(),
                title: schema.string(),
            });

            const userSchema = schema.record({
                userName: schema.string(),
                posts: schema.list(postSchema),
            });

            const postsInput = faker.repeat.asList(3, () => {
                return new StdRecord({
                    id: faker.notNumber(),
                    title: faker.notString(),
                });
            })

            const userInput = new StdRecord({
                userName: faker.string(),
                posts: postsInput,
            });


            userSchema.validate(userInput).match({
                Ok(ok) {
                    assert.fail("Expected Err but get Ok")
                },
                Err(err) {
                    const postsErrors = err.data.get("posts").unwrapByKey("data");

                    for(const [key, err] of postsErrors) {
                        const errData = err.unwrapByKey("data");
                        assert.equal(errData.get("id").unwrapByKey("msg"), "Expected number")
                        assert.equal(errData.get("title").unwrapByKey("msg"), "Expected string")

                    }
                }
            })
        }),
]
)