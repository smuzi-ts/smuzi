import {testRunner} from "./index.js";
import {schema} from "#lib/index.js";
import {assert, it} from "@smuzi/tests";
import {faker} from "@smuzi/faker";
import {StdRecord} from "@smuzi/std";


testRunner.describe("Std-Schema-Record", [
    it("with Map-Ok", () => {
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

    it("with Map-Err", () => {
        const postSchema = schema.record({
            id: schema.number(),
        });

        const userSchema = schema.record({
            userName: schema.string(),
            posts: schema.map(schema.number(), postSchema),
        });

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
]);

