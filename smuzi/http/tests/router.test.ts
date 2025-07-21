import { isString, match, MathedData, None, Option, ParamsMathedData, StringValuePatterns, Struct } from "@smuzi/std";
import { assert, describe, it, okMsg, skip } from "@smuzi/tests";
import { dump } from "../../std/src/debug";

enum HttpMethod {
    GET = "GET",
    POST = "POST"
}

type PathParam =  StringValuePatterns

type HttpRoute = { path: PathParam, method: HttpMethod };

type HttpRouter = {
    get: (path: PathParam, action) => void
    post: (path: PathParam, action) => void
    group: (params: HttpRoute, handler: (router: HttpRouter) => HttpRouter) => void
    getMapRoutes: () => Map<HttpRoute, any> //TODO any to concrete type
}

type HttpRequest = { path: string, method: HttpMethod, params: Option<unknown> };

const HttpRequest = Struct<HttpRequest>();

type HttpContext = {
    request: HttpRequest,
    params: ParamsMathedData,
}
const HttpContext = Struct<HttpContext>();


function processPath(path: string): string | RegExp {
  if (! isString(path)) return path;
  if (! /\{[a-zA-Z0-9_]+\}/g.test(path)) return path;

  const pattern = `^${ path.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => `(?<${name}>[^/]+)`).replace(/\//g, '\\/') }$`;
  return new RegExp(pattern);
}

function Router(): HttpRouter
{
    const routes = new Map()

    const add = (route, action) => {
        route.path = processPath(route.path);
        routes.set(route, (data: MathedData) => {
            const context = new HttpContext({
                request: data.val,
                params: data.params.getFlat('path'),
              })
            return action(context);
        })
    }

    return {
        get(path, action) {
            add({ path, method: HttpMethod.GET }, action)
        },
        post(path, action) {
            add({ path, method: HttpMethod.POST }, action)
        },
        group(params: HttpRoute, handler) {
            const action = (request: HttpRequest) => {
                
            }

            add(params, action);
        },     
        getMapRoutes()
        {
            return routes;
        }
    }
}

describe("Std-Router", () => {
    it(okMsg("Routing with special string-pattern"), () => {
        const router = Router();
        router.get("users", () => "list"); //<-- request1
        router.post("users", () => "create"); //<-- request2
        router.get("users/{id}", (context: HttpContext) => {
            return "find id=" + context.params.getUnwrap('id')
        }); //<-- request3


        const request1 = new HttpRequest({ path: "users", method: HttpMethod.GET, params: None()})
        const action1 = match(request1, router.getMapRoutes(), "not found")
        assert.equal(action1, "list")

        const request2 = new HttpRequest({ path: "users", method: HttpMethod.POST, params: None()})
        const action2 = match(request2, router.getMapRoutes(), "not found")
        assert.equal(action2, "create")

        const request3 = new HttpRequest({ path: "users/222", method: HttpMethod.GET, params: None()})
        const action3 = match(request3, router.getMapRoutes(), "not found")
        assert.equal(action3, "find id=222")
    });
})