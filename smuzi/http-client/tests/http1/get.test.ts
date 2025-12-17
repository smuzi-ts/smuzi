import {assert, describe, it, okMsg} from "@smuzi/tests";
import {Some, RequestHttpHeaders, StdError, StdList, StdRecord} from "@smuzi/std";
import {apiConfig, httpClient} from "./config/config.js";
import {faker} from "@smuzi/faker";

export default describe("http-client-http1-GET-", [
        it("without options", async () => {
            type User = StdRecord<{ email: string, name: string }>;
            type UsersList = StdList<User>

            const response = await httpClient.get<UsersList>('/users/list');

            const body = response.unwrap().body.unwrap();
            const user = body.get(0).unwrap();

            assert.isString(user.get("email").unwrap())
            assert.isString(user.get("name").unwrap())

        }),

        it("not found", async () => {
            const response = (await httpClient.get('/users/list/notFound'));
            assert.result.equalErr(response);

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

            assert.result.equalErr(response);

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

            assert.result.equalOk(response);

            response.okThen((resp) => {
                assert.equal(resp.status, 200);
                assert.equal(resp.statusText, "Authorized");
            })
        }),
        it("echo query", async () => {

            const query = {
                a: faker.string(),
                b: faker.string(),
                c: faker.string(),
            };

            type ResponseJson = StdRecord<typeof query>

            const response = await httpClient.get<ResponseJson>('/echoQuery', {query});

            assert.result.equalOk(response);

            response.okThen((resp) => {
                assert.equal(resp.status, 200);
                assert.equal(resp.statusText, "OK");
                const body = resp.body.unwrap();
                assert.equal(body.get("a").unwrap(), query.a);
                assert.equal(body.get("b").unwrap(), query.b);
                assert.equal(body.get("c").unwrap(), query.c);
            })
        }),

        it(okMsg("echo custom headers"), async () => {

            const headers = new RequestHttpHeaders();

            headers.setOther("x-custom", "xxx");
            headers.setOther("y-custom", "yyy");
            headers.setOther("z-custom", "zzz");

            const response = await httpClient.get('/echoHeaders', {headers});

            assert.result.equalOk(response);

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