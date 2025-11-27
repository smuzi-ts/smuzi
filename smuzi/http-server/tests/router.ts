import { dump, match, Option, HttpMethod } from "@smuzi/std";
import { assert, describe, it, okMsg } from "@smuzi/tests";
import {type Context, CreateHttpRouter} from "#lib/router.js";

type BookContext = Context<Option<{id: Option<string>}>>;
type UserContext = Context<Option<{id: Option<string>}>>;

export default describe("Std-Router", [
    it(okMsg("Routing with special string-pattern"), async () => {
        function actionBooksFind(context: BookContext) {
            return "books find id=" + context.params.unwrapByKey('id')
        }

        const router = CreateHttpRouter({path: ''}, () => {
            return "not found"
        });

        router.get("users", () => "list"); //<-- request1
        router.post("users", () => "create"); //<-- request2
        router.get("users/{id}", (context: UserContext) => {
            return "user find id=" + context.params.unwrapByKey('id')
        }); //<-- request3

        const booksRouter = CreateHttpRouter({path: 'books'})
        router.group(booksRouter)

        booksRouter.get("/any", () => "books list");
        booksRouter.get("/{id}", actionBooksFind)  //<-- request4


        const postsRouter = CreateHttpRouter({path: "posts/{post_id}" })

        postsRouter.get("/attachments/{id}", () => "posts list");
        postsRouter.get("/attachments/{id}", () => "posts list"); //<-- request5

        const mapRequestAction = new Map();
        mapRequestAction.set({ path: "users", method: HttpMethod.GET}, "list");
        mapRequestAction.set({ path: "users", method: HttpMethod.POST }, "create");
        mapRequestAction.set({ path: "users/222", method: HttpMethod.GET }, "user find id=222");
        mapRequestAction.set({ path: "books/any", method: HttpMethod.GET }, "books list");
        mapRequestAction.set({ path: "books/333", method: HttpMethod.GET }, "books find id=333");
        mapRequestAction.set({ path: "not_found", method: HttpMethod.GET }, "not found");

        for (const [request, expectedResponse] of mapRequestAction) {
            const actualResponse = router.match(request);
            assert.equal(actualResponse, expectedResponse);
        }
    ;
    })
])
