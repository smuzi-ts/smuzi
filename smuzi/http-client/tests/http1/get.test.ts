import { assert, describe, it, okMsg } from "@smuzi/tests";
import { dump, Option, Some, RequestHttpHeaders, ClientHttpHeaders, StdError } from "@smuzi/std";
import { apiConfig, httpClient } from "./config/config.js";
import { faker } from "@smuzi/faker";

export default describe("http-client - GET request", [
    it(okMsg(" without options"), async () => {
        type User = { email: Option<string>, name: Option<string> };
        type UsersList = User[]

        const response = await httpClient.get<UsersList>('/users/list');

        response.match({
            Err: (error) => {
                assert.fail(error instanceof StdError ? error : error.statusText)
            },
            Ok: (response) => {
                assert.isSome(response.body);
                const data = response.body;
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

    it(okMsg("not found"), async () => {
        const response = await httpClient.get('/users/list/notFound');
        assert.result.failIfOk(response);

        response.errThen((err) => {
            if (err instanceof StdError) {
                assert.fail(err);
            }
            assert.equal(err.status, 404);
            assert.equal(err.statusText, "Not Found");
        })
    }),

    it(okMsg("unauthorized"), async () => {
        const response = await httpClient.get('/users/auth');

        assert.result.failIfOk(response);

        response.errThen((err) => {
                        if (err instanceof StdError) {
                assert.fail(err);
            }
            assert.equal(err.status, 401);
            assert.equal(err.statusText, "Unauthorized");
        })
    }),

        it(okMsg("success authorized"), async () => {

        const response = await httpClient.get('/users/auth', {query: {token: apiConfig.key}});

        assert.result.failIfError(response);

        response.okThen((resp) => {
            assert.equal(resp.status, 200);
            assert.equal(resp.statusText, "Authorized");
        })
    }),
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
            assert.deepEqual(resp.body, Some({
                a: Some(query.a),
                b: Some(query.b),
                c: Some(query.c)
            }));

        })
    }),

    it(okMsg("successed auth via Header"), async () => {

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
            assert.deepEqual(resp.body, Some({
                a: Some(query.a),
                b: Some(query.b),
                c: Some(query.c)
            }));

        })
    }),

    it(okMsg("echo headers"), async () => {

        const headers = new RequestHttpHeaders();

        headers.setOther("x-custom", "xxx");
        headers.setOther("y-custom", "yyy");
        headers.setOther("z-custom", "zzz");

        const response = await httpClient.get('/echoHeaders', {headers});

        assert.result.failIfError(response);

        response.okThen((resp) => {
            assert.equal(resp.status, 200);
            assert.equal(resp.statusText, "OK");
            assert.deepEqual(resp.headers.getOther("x-custom"), Some("xxx"));
            assert.deepEqual(resp.headers.getOther("y-custom"), Some("yyy"));
            assert.deepEqual(resp.headers.getOther("z-custom"), Some("zzz"));
        })
    }),
]
)