import { assert, describe, it, okMsg, skip } from "@smuzi/tests";
import { match } from "#std/match.ts";
import { Struct } from "#std/struct.ts";

describe("Std-match-Struct", () => {
    it(okMsg("Simple http router"), () => {
        enum HttpMethod {
            GET = "GET",
            POST = "POST"
        }

        const HttpRequest = Struct<{path: string, method: HttpMethod}>('HttpRequest');
        
        const routes = new Map();
        routes.set({ path: "users", method: HttpMethod.GET }, "list"); //<-- request1
        routes.set({ path: "users", method: HttpMethod.POST }, "create"); //<-- request2
        routes.set({ path: /^users\/\d+$/, method: HttpMethod.GET }, "find"); //<-- request3
        routes.set({ path: /^users\/\d+$/, method: HttpMethod.POST }, "update"); //<-- request4

        const request1 = new HttpRequest({path: "users", method: HttpMethod.GET})
        const action1 = match(request1, routes, "not found")
        assert.equal(action1, "list")

        const request2 = new HttpRequest({path: "users", method: HttpMethod.POST})
        const action2 = match(request2, routes, "not found")
        assert.equal(action2, "create")

        const request3 = new HttpRequest({path: "users/12345", method: HttpMethod.GET})
        const action3 = match(request3, routes, "not found")
        assert.equal(action3, "find")

        const request4 = new HttpRequest({path: "users/12345", method: HttpMethod.POST})
        const action4 = match(request4, routes, "not found")
        assert.equal(action4, "update")

        const request5 = new HttpRequest({path: "customers", method: HttpMethod.GET})
        const action5 = match(request5, routes, "not found")
        assert.equal(action5, "not found")
    })
})