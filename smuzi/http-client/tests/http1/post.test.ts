import { assert, describe, it } from "@smuzi/tests";
import { apiConfig, httpClient } from "./config/config.js";
import {dump} from "@smuzi/std";

export default describe("http-client-http1-POST-", [
    it("body simple string", async () => {
        const response = await httpClient.post('/echoBodyString', );
        const json = response.unwrap().body.unwrap();
        dump({json})
    }),
]
)