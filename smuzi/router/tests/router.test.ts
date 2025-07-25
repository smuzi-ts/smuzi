import { asArray, asFunction, asRegExp, asString, isString, match, MathedData, None, Option, panic, ParamsMathedData, Some, StringValuePatterns, Struct } from "@smuzi/std";
import { assert, describe, it, okMsg, skip } from "@smuzi/tests";
import { dump } from "../../std/src/debug";

enum Method {
    GET = "GET",
    POST = "POST"
}

type Action = any
type PathParam = string | RegExp;

type Route = { path: PathParam, method: Method };
type GroupRoute = { path: PathParam};

type Router = {
    get: (path: PathParam, action) => void
    post: (path: PathParam, action) => void
    group: (params: GroupRoute, handler: (router: Router) => Router) => void
    getMapRoutes: () => Map<Route, any> //TODO any to concrete type
}

type InputMessage = { path: string, method: Method, params: Option<unknown> };

const InputMessage = Struct<InputMessage>();

type Context = {
    request: InputMessage,
    params: ParamsMathedData,
}

const Context = Struct<Context>();

function processPath(path: PathParam): PathParam {
  if (! asString(path)) return path;
  if (! /\{[a-zA-Z0-9_]+\}/g.test(path)) return path;

  const pattern = `^${ path.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => `(?<${name}>[^/]+)`).replace(/\//g, '\\/') }$`;
  return new RegExp(pattern);

}

function contactPaths(path1: PathParam, path2: PathParam): PathParam | never
{
    const path1AsRegExp = asRegExp(path1);
    const path2AsRegExp = asRegExp(path2);

    if (path1AsRegExp || path2AsRegExp) {
        return new RegExp((path1AsRegExp ? path1.source : path1) + (path2AsRegExp ? path2.source : path2));
    }

    return path1 + path2;
}


function toStartWithPattern(input: PathParam): RegExp {
  if (asString(input)) {
    const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}.*`);
  }

    let pattern = input.source;

    if (pattern.endsWith('$')) {
      pattern = pattern.slice(0, -1);
    }

    return new RegExp(`${pattern}.*`, input.flags);
}

function Router(groupRoute: Option<GroupRoute> = None()): Router
{
    const routes = new Map()

    const add = (route: Route | GroupRoute, action) => {
        route.path = processPath(groupRoute.match({
            Some: (g) => contactPaths(g.path, route.path),
            None: () => route.path
        }));
        
        routes.set(route, (data: MathedData) => {
            const context = new Context({
                request: data.val,
                params: data.params.getFlat('path'),
              })
            return action(context);
        })
    }

    return {
        get(path, action) {
            add({ path, method: Method.GET }, action)
        },
        post(path, action) {
            add({ path, method: Method.POST }, action)
        },
        group(route: GroupRoute, handler) {
            const groupPath = toStartWithPattern(route.path);

            const action = (context: Context) => {
                const groupRouter = handler(Router(Some(route)));
                const matched = match(context.request, groupRouter.getMapRoutes(), "not found");

                return matched;
            }

            add({path: groupPath}, action);
        },     
        getMapRoutes()
        {
            return routes;
        }
    }
}

describe("Std-Router", () => {
    it(okMsg("Routing with special string-pattern"), () => {
        function actionBooksFind(context: Context) {
            return "books find id=" + context.params.getUnwrap('id')
        }
        
        const router = Router();

        router.get("users", () => "list"); //<-- request1
        router.post("users", () => "create"); //<-- request2
        router.get("users/{id}", (context: Context) => {
            return "user find id=" + context.params.getUnwrap('id')
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
        mapRequestAction.set({ path: "users", method: Method.GET, params: None()}, "list");
        mapRequestAction.set({ path: "users", method: Method.POST, params: None()}, "create");
        mapRequestAction.set({ path: "users/222", method: Method.GET, params: None()}, "user find id=222");
        mapRequestAction.set({ path: "books/any", method: Method.GET, params: None()}, "books list");
        mapRequestAction.set({ path: "books/333", method: Method.GET, params: None()}, "books find id=333");

        for (const [request, exptextedResponse] of mapRequestAction) {
            const actualResponse = match(new InputMessage(request), router.getMapRoutes(), "not found")
            assert.equal(actualResponse, exptextedResponse);
        }
    });
})