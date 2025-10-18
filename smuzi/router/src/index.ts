import { asRegExp, asString, match, MathedData, None, Option, ParamsMatchedData, Some, Struct } from "@smuzi/std";

export enum Method {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
}

export function methodFromString(method: string): Option<Method>
{
    const handers = new Map([
        ['GET', Some(Method.GET)],
        ['POST', Some(Method.POST)],
        ['PUT', Some(Method.PUT)],
        ['DELETE', Some(Method.DELETE)],
    ]);

    return match(
        method,
        handers,
        None(),
        false
    );
}

type Action = any
type PathParam = string | RegExp;

type Route = { path: PathParam, method: Method };
type GroupRoute = { path: PathParam};

export type Index = {
    get: (path: PathParam, action: Action) => void
    post: (path: PathParam, action: Action) => void
    put: (path: PathParam, action: Action) => void
    delete: (path: PathParam, action: Action) => void
    group: (params: GroupRoute, Index) => void
    getMapRoutes: () => Map<Route, any> //TODO any to concrete type
}

export type InputMessage = { path: string, method: Method};

export const SInputMessage = Struct<InputMessage>();

export type Context = {
    request: InputMessage,
    params: ParamsMatchedData,
}

export const SContext = Struct<Context>();

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

export function CreateRouter(groupRoute: Option<GroupRoute> = None()): Index
{
    const routes = new Map()

    const add = (route: Route | GroupRoute, action) => {
        route.path = processPath(groupRoute.match({
            Some: (g) => contactPaths(g.path, route.path),
            None: () => route.path
        }));
        
        routes.set(route, (data: MathedData) => {
            const context = new SContext({
                request: data.val,
                params: data.params.flatByKey('path'),
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
        put(path, action) {
            add({ path, method: Method.PUT }, action)
        },
        delete(path, action) {
            add({ path, method: Method.DELETE }, action)
        },
        group(params: GroupRoute, groupRouter: Index) {
            const groupPath = toStartWithPattern(params.path);

            const action = (context: Context) => {
                console.log('groupRouter.getMapRoutes()', groupRouter.getMapRoutes())
                return match(context.request, groupRouter.getMapRoutes(), "not found");
            }

            add({path: groupPath}, action);
        },     
        getMapRoutes()
        {
            return routes;
        }
    }
}
