import { match, None } from "@smuzi/std";
import { assert, describe, it, okMsg } from "@smuzi/tests";
import {type Context, CreateRouter, Method, type Router, SInputMessage} from "#lib/router.ts";

describe("Std-Router", () => {
    it(okMsg("Routing with special string-pattern"), () => {
        function actionBooksFind(context: Context) {
            return "books find id=" + context.params.unwrapByKey('id')
        }
        
        const router = CreateRouter();

        router.get("users", () => "list"); //<-- request1
        router.post("users", () => "create"); //<-- request2
        router.get("users/{id}", (context: Context) => {
            return "user find id=" + context.params.unwrapByKey('id')
        }); //<-- request3
        router.group({ path: "books" }, (group: Router) => {
            group.get("/any", () => "books list");
            group.get("/{id}", actionBooksFind)  //<-- request4
            return group;
        });

        router.group({ path: "posts/{post_id}" }, (group: Router) => {
            group.get("/attachments/{id}", () => "posts list");
            group.get("/attachments/{id}", () => "posts list"); //<-- request5
            return group;
        });

        const mapRequestAction = new Map();
        mapRequestAction.set({ path: "users"}, "list");
        mapRequestAction.set({ path: "users", method: Method.POST }, "create");
        mapRequestAction.set({ path: "users/222", method: Method.GET }, "user find id=222");
        mapRequestAction.set({ path: "books/any", method: Method.GET }, "books list");
        mapRequestAction.set({ path: "books/333", method: Method.GET }, "books find id=333");

        for (const [request, exptextedResponse] of mapRequestAction) {
            const actualResponse = match(new SInputMessage(request), router.getMapRoutes(), "not found")
            assert.equal(actualResponse, exptextedResponse);
        }
    });
})
