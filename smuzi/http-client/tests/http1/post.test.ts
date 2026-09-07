import { it, assert } from "@smuzi/tests";
import { httpClient } from "./config/config.js";
import {dump, Some, StdRecord} from "@smuzi/std";
import { faker } from "@smuzi/faker";
import {schema} from "@smuzi/schema";
import {http1TestRunner} from "./index.js";

http1TestRunner.describe("http-client-http1-POST-", [
    it("echo json", async () => {
        const userSchema = schema.record({
            name: schema.string(),
            age: schema.number(),
            posts: schema.list(schema.record({
                id: schema.number(),
                subject: schema.string(),
            }))
        })

        const createUser = faker.schema.make(userSchema);

        const response = await httpClient.post<typeof createUser>('/echoBodyString', {
            body: Some(createUser)
        });


        const responseBody = response
            .unwrap()
            .body
            .unwrap();


        assert.result.equalOk(userSchema.validate(responseBody))

    }),
]
)