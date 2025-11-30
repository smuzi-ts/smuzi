import { assert, describe, it, okMsg } from "@smuzi/tests";
import { dump, Option, Some, StdRequestHttpHeaders } from "@smuzi/std";
import { apiConfig, httpClient } from "./config/config.js";
import { faker } from "@smuzi/faker";


export default describe("http-client - GET request", [
    it(okMsg(" without options"), async () => {
        type User = { email: Option<string>, name: Option<string> };
        type UsersList = User[]

        const response = await httpClient.get<UsersList>('/users/list');

        response.match({
            Err: (error) => assert.fail(error.statusText),
            Ok: (response) => {
                assert.isSome(response.data);
                const data = response.data;
                data.match({
                    None() {
                        assert.fail("Expected Some data")
                    },
                    Some(list) {
                        assert.isSome(list[0]);

                        const user = list[0];

                        list[0].match({
                            None() {
                                assert.fail("Expected Some user entity")
                            },
                            Some(user) {
                                assert.object.hasProperty(user, "email")
                                assert.object.hasProperty(user, "name")
                            }
                        })

                    }
                })
            },
        })
    }),

    // it(okMsg("not found"), async () => {
    //     const response = await httpClient.get('/users/list/notFound');
    //     assert.result.failIfOk(response);

    //     response.errThen((resp) => {
    //         assert.equal(resp.status, 404);
    //         assert.equal(resp.statusText, "Not Found");
    //     })
    // }),

    // it(okMsg("unauthorized"), async () => {
    //     const response = await httpClient.get('/users/auth');

    //     assert.result.failIfOk(response);

    //     response.errThen((resp) => {
    //         assert.equal(resp.status, 401);
    //         assert.equal(resp.statusText, "Unauthorized");
    //     })
    // }),

    //     it(okMsg("success authorized"), async () => {

    //     const response = await httpClient.get('/users/auth', {query: {token: apiConfig.key}});

    //     assert.result.failIfError(response);

    //     response.okThen((resp) => {
    //         assert.equal(resp.status, 200);
    //         assert.equal(resp.statusText, "Authorized");
    //     })
    // }),
    it(okMsg("echo query"), async () => {

        const query = {
            a: faker.string(),
            b: faker.string(),
            c: faker.string(),
        };

        const response = await httpClient.get('/echoQuery', {query});

        assert.result.failIfError(response);

        response.okThen((resp) => {
            assert.equal(resp.status, 200);
            assert.equal(resp.statusText, "OK");
            assert.deepEqual(resp.data, Some({
                a: Some(query.a),
                b: Some(query.b),
                c: Some(query.c)
            }));

        })
    }),

    // it(okMsg("successed auth via Header"), async () => {

    //     const query = {
    //         a: faker.string(),
    //         b: faker.string(),
    //         c: faker.string(),
    //     };

    //     const response = await httpClient.get('/echoQuery', {query});

    //     assert.result.failIfError(response);

    //     response.okThen((resp) => {
    //         assert.equal(resp.status, 200);
    //         assert.equal(resp.statusText, "OK");
    //         assert.deepEqual(resp.data, Some({
    //             a: Some(query.a),
    //             b: Some(query.b),
    //             c: Some(query.c)
    //         }));

    //     })
    // }),

    // it(okMsg("echo headers"), async () => {

    //     const headers = new StdRequestHttpHeaders();

    //     headers.setOther("X-Csutom", "xxx");
    //     headers.setOther("Y-Csutom", "yyy");
    //     headers.setOther("Z-Csutom", "zzz");

    //     const response = await httpClient.get('/echoHeaders', {headers});

    //     assert.result.failIfError(response);

    //     response.okThen((resp) => {
    //         assert.equal(resp.status, 200);
    //         assert.equal(resp.statusText, "OK");
    //         assert.equal(resp.headers.getOther("X-Csutom"), "xxx");
    //         assert.equal(resp.headers.getOther("Y-Csutom"), "yyy");
    //         assert.equal(resp.headers.getOther("Z-Csutom"), "zzz");

    //     })
    // }),
]
)