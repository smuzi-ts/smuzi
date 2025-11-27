import { assert, describe, it, okMsg } from "@smuzi/tests";
import { dump, None, Some } from "@smuzi/std";
import { buildHttpClient, HttpResponse } from "#lib/index.js";
import {  serverEndpoint } from "./config.js";


export default describe("http-client - GET request - ", [
    it(okMsg(" without options"), async () => {
        const httpClient = buildHttpClient({
            baseUrl: None(),
        });

        const response = await httpClient.get(serverEndpoint + '/users/list');

        response.match({
            Err: (error) => assert.fail(error.statusText),
            Ok: (response) => {
                assert.isSome(response.data);
                const data = response.data.unwrap();
                assert.isSome(data);
                assert.isArray(data);
                assert.isObject(data[0]);

                assert.object.hasProperty(data[0], "name");
                assert.object.hasProperty(data[0], "email");

                assert.isObject(data[1]);
                assert.object.hasProperty(data[1], "name");
                assert.object.hasProperty(data[1], "email");
            },
        })
    }),

    // it(okMsg("not found"), async () => {
    //     const httpClient = buildHttpClient({
    //         baseUrl: None(),
    //     });

    //     const response = await httpClient.get(serverEndpoint + '/users/list/notFound');
    //     assert.result.failIfOk(response);
    //     response.errThen((resp) => {
    //         assert.isObject(resp);
    //         assert.equal(resp.data.unwrap(), "not found");
    //     })
    
    // })
]
)