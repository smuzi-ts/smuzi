import {assert, describe, it, okMsg, before, after} from "@smuzi/tests";
import {dump, None, Some} from "@smuzi/std";
import {buildHttpClient} from "#lib/index.js";
import { globalSetup, globalTeardown, serverEndpoint } from "./setup.js";


describe("http-client - GET", async () => {

    before(globalSetup);
    after(globalTeardown);

    
    it(okMsg("GET"), async () => {
        const httpClient = buildHttpClient({
            baseUrl: None(),
        });

         const jsonResponse = await httpClient.get(serverEndpoint);

         console.log(jsonResponse);

    })
})