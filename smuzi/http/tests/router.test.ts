import { match, Struct } from "@smuzi/std";
import { assert, describe, it, okMsg, skip } from "@smuzi/tests";

enum HttpMethod {
    GET = "GET",
    POST = "POST"
}

const HttpRequest = Struct<{ path: string, method: string }>('HttpRequest');

describe("Std-Router", () => {
    it(okMsg(""), () => {
        const routes = new Map();
        routes.set({ path: "users", method: HttpMethod.GET }, "list"); //<-- request1
        routes.set({ path: "users", method: HttpMethod.POST }, "create"); //<-- request2
        routes.set({ path: /^users\/\d+$/, method: HttpMethod.GET }, "find"); //<-- request3
        routes.set({ path: /^users\/\d+$/, method: HttpMethod.POST }, "update"); //<-- request4

        const request1 = new HttpRequest({ path: "users", method: HttpMethod.GET })
        const action1 = match(request1, routes, "not found")
        assert.equal(action1, "list")
    });
})