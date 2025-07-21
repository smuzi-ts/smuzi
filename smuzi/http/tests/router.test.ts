import { isString, match, MathedData, None, Option, Some, StringValuePatterns, Struct } from "@smuzi/std";
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
    getMapRoutes: () => Map<HttpRoute, any> //TODO any to concrete type
}

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
            const routeParams = data.params.match({
                Some: (v: any) => {
                   return v.path.match({
                    Some: (v: any) => Some(dump(v.path)),
                    None: () => None()
                   })
                },
                None: () => None()
            })

            return action(data.val, routeParams);
        })
    }

    return {
        get(path, action) {
            add({path, method: HttpMethod.GET}, action)
        },
        post(path, action) {
            add({path, method: HttpMethod.POST}, action)
        },
        getMapRoutes()
        {
            return routes;
        }
    }
}

const HttpRequest = Struct<{ path: string, method: HttpMethod, params: Option<unknown> }>('HttpRequest');

describe("Std-Router", () => {
    it(okMsg("LIB"), () => {
        const router = Router();
        router.get("users", () => "list"); //<-- request1
        router.post("users", () => "create"); //<-- request2
        router.get("users/{id}", (request, route) => {
            dump({request, route});
            return "find id="
        }); //<-- request3


        const request1 = new HttpRequest({ path: "users", method: HttpMethod.GET})
        const action1 = match(request1, router.getMapRoutes(), "not found")
        assert.equal(action1, "list")

        const request2 = new HttpRequest({ path: "users", method: HttpMethod.POST })
        const action2 = match(request2, router.getMapRoutes(), "not found")
        assert.equal(action2, "create")

        const request3 = new HttpRequest({ path: "users/222", method: HttpMethod.GET })
        const action3 = match(request3, router.getMapRoutes(), "not found")
        assert.equal(action3, "find")
    });
})