import { assert, describe, it } from "@smuzi/tests";
import { apiConfig, httpClient } from "./config/config.js";

export default describe("http-client - GET request", [
    it("body simple string", async () => {
        const response = await httpClient.post('/echoBodyString'); 
    }),
]
)