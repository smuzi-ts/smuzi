import { match, None } from "@smuzi/std";
import { assert, describe, it, okMsg } from "@smuzi/tests";
import {type Context, CreateRouter, Method, type Index, SInputMessage} from "#lib/index.ts";

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

        const booksRouter = CreateRouter({ path: "books" });

        booksRouter.get("/any", () => "books list");
        booksRouter.get("/{id}", actionBooksFind)  //<-- request4

        router.group(booksRouter);

        const postsRouter = CreateRouter({ path: "posts/{post_id}" });
        postsRouter.get("/attachments/{id}", () => "posts list");
        postsRouter.post("/attachments/{id}", () => "posts list"); //<-- request5

        router.group(postsRouter);

        const mapRequestAction = new Map();
        mapRequestAction.set({ path: "users", method: Method.GET}, "list");
        mapRequestAction.set({ path: "users", method: Method.POST }, "create");
        mapRequestAction.set({ path: "users/222", method: Method.GET }, "user find id=222");
        mapRequestAction.set({ path: "books/any", method: Method.GET }, "books list");
        mapRequestAction.set({ path: "books/333", method: Method.GET }, "books find id=333");

        for (const [request, expectedResponse] of mapRequestAction) {
            const actualResponse = match(new SInputMessage(request), router.getMapRoutes(), "not found")
            assert.equal(actualResponse, expectedResponse);
        }
    });
})
