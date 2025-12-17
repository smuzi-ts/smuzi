import { dump, match, Option, HttpMethod, None, HttpRequest } from "@smuzi/std";
import { assert, describe, it, okMsg } from "@smuzi/tests";
import { type Context, CreateHttp1Router } from "#lib/router.js";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";

type BookContext = Context<ServerResponse, Option<{ id: Option<string> }>>;
type UserContext = Context<ServerResponse, Option<{ id: Option<string> }>>;

function actionBooksFind(context: BookContext) {
    return "books find id=" + context.pathParams.unwrapByKey('id')
}

const routerTest = CreateHttp1Router({ path: '' }, () => {
    return "not found"
});

routerTest.get("users", () => "list"); //<-- request1
routerTest.post("users", () => "create"); //<-- request2
routerTest.get("users/{id}", (context: UserContext) => {
    return "user find id=" + context.pathParams.unwrapByKey('id')
}); //<-- request3

const booksRouter = CreateHttp1Router({ path: 'books' })
routerTest.group(booksRouter)

booksRouter.get("/any", () => "books list");
booksRouter.get("/{id}", actionBooksFind)  //<-- request4


const postsRouter = CreateHttp1Router({ path: "posts/{post_id}" })

postsRouter.get("/attachments/{id}", () => "posts list");
postsRouter.get("/attachments/{id}", () => "posts list"); //<-- request5



export default describe("std-Router", [
    it(okMsg("get users"), async () => {
        const request = new HttpRequest({ path: "users", method: HttpMethod.GET});
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "list");
    }),
    it(okMsg("create user"), async () => {
        const request = new HttpRequest({ path: "users", method: HttpMethod.POST });
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "create");
    }),
    it(okMsg("find user by id"), async () => {
        const request = new HttpRequest({ path: "users/222", method: HttpMethod.GET });
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "user find id=222");
    }),
    it(okMsg("books list"), async () => {
        const request = new HttpRequest({ path: "books/any", method: HttpMethod.GET });
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "books list");
    }),
    it("books find by id", async () => {
        const request = new HttpRequest({ path: "books/333", method: HttpMethod.GET });
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "books find id=333");
    }),
    it("not found", async () => {
        const request = new HttpRequest({ path: "not_found", method: HttpMethod.GET });
        const route = routerTest.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            pathParams: route.pathParams
        })

        assert.equal(actualResponse, "not found");
    }),
])
