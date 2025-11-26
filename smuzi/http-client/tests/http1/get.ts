import { assert, describe, it, okMsg } from "@smuzi/tests";
import { dump, None, Some } from "@smuzi/std";
import { buildHttpClient } from "#lib/index.js";
import {  serverEndpoint } from "./config.js";


export default describe("http-client - GET", [
    it(okMsg("GET"), async () => {
        const httpClient = buildHttpClient({
            baseUrl: None(),
        });

        const jsonResponse = await httpClient.get(serverEndpoint + '/users/list');

        console.log(jsonResponse);
    })
]
)