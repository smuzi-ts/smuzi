import { describe, it, assert } from "@smuzi/tests";
import { httpClient } from "./config/config.js";
import {dump, Some, StdRecord} from "@smuzi/std";
import { faker } from "@smuzi/faker";
import {schema} from "@smuzi/schema";

export default describe("http-client-http1-POST-", [
    it("body simple string", async () => {
        const userShema = schema.record({
            name: schema.string(),
            age: schema.number(),
        })

        const createUser = new StdRecord({
            name: faker.string(),
            age: faker.number(),
        })
        const response = await httpClient.post('/echoBodyString', {
            body: Some(createUser)
        });

        const responseBody = response
            .unwrap()
            .body
            .unwrap();

        assert.equal(responseBody.get());
    }),
]
)