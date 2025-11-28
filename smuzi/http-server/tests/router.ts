import { dump, match, Option, HttpMethod, None } from "@smuzi/std";
import { assert, describe, it, okMsg } from "@smuzi/tests";
import { type Context, CreateHttpRouter } from "#lib/router.js";
import { IncomingMessage, ServerResponse } from "http";
import { Socket } from "net";

type BookContext = Context<ServerResponse, Option<{ id: Option<string> }>>;
type UserContext = Context<ServerResponse, Option<{ id: Option<string> }>>;

function actionBooksFind(context: BookContext) {
    return "books find id=" + context.params.unwrapByKey('id')
}

const router = CreateHttpRouter({ path: '' }, () => {
    return "not found"
});

router.get("users", () => "list"); //<-- request1
router.post("users", () => "create"); //<-- request2
router.get("users/{id}", (context: UserContext) => {
    return "user find id=" + context.params.unwrapByKey('id')
}); //<-- request3

const booksRouter = CreateHttpRouter({ path: 'books' })
router.group(booksRouter)

booksRouter.get("/any", () => "books list");
booksRouter.get("/{id}", actionBooksFind)  //<-- request4


const postsRouter = CreateHttpRouter({ path: "posts/{post_id}" })

postsRouter.get("/attachments/{id}", () => "posts list");
postsRouter.get("/attachments/{id}", () => "posts list"); //<-- request5



export default describe("std-Router", [
    it(okMsg("get users"), async () => {
        const request = { path: "users", method: HttpMethod.GET, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "list");
    }),
    it(okMsg("create user"), async () => {
        const request = { path: "users", method: HttpMethod.POST, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "create");
    }),
    it(okMsg("find user by id"), async () => {
        const request = { path: "users/222", method: HttpMethod.GET, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "user find id=222");
    }),
    it(okMsg("books list"), async () => {
        const request = { path: "books/any", method: HttpMethod.GET, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "books list");
    }),
    it("books find by id", async () => {
        const request = { path: "books/333", method: HttpMethod.GET, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "books find id=333");
    }),
    it("not found", async () => {
        const request = { path: "not_found", method: HttpMethod.GET, query: new URLSearchParams };
        const route = router.match(request);
        const actualResponse = route.action({
            request,
            response: new ServerResponse(new IncomingMessage(new Socket)),
            params: route.pathParams
        })

        assert.equal(actualResponse, "not found");
    }),
])
