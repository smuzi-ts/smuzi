import {assert, describe, it, okMsg} from "@smuzi/tests";
import {faker} from "@smuzi/faker";
import {httpClient} from "#lib/index.js";


describe("http-client - GET", () => {
    it(okMsg("GET"), async () => {
        const httpClient = httpClient();
    })
})