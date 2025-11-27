import {
    asRegExp,
    asString,
    match,
    MatchedData,
    None,
    Option,
    Some,
    Struct,
    HttpMethod,
    HttpResponse,
} from "@smuzi/std";

export type ActionResponse = string | number | Record<string, unknown> | any[] | HttpResponse;
export type Action = (context: Context) => ActionResponse
export type PathParam = string | RegExp;

type Route = { path: PathParam, method: HttpMethod };
type GroupRoute = { path: PathParam };

export type Router = {
    group: (groupRouter: Router) => void
    getMapRoutes: () => Map<Route, Action>
    getGroupRoute(): GroupRoute
    get: (path: PathParam, action: Action) => void
    post: (path: PathParam, action: Action) => void
    put: (path: PathParam, action: Action) => void
    delete: (path: PathParam, action: Action) => void
    getNotFoundHandler: () => Action
    match: (request: InputMessage) => ActionResponse
}

export type InputMessage = { path: string, method: HttpMethod, query: URLSearchParams};

export type Context<Params = unknown> = {
    request: InputMessage,
    params: Params,
}

export function processPath(path: PathParam): PathParam {
    if (!asString(path)) return path;
    if (! /\{[a-zA-Z0-9_]+\}/g.test(path)) return path;

    const pattern = `^${path.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => `(?<${name}>[^/]+)`).replace(/\//g, '\\/')}$`;
    return new RegExp(pattern);

}

export function contactPaths(path1: PathParam, path2: PathParam): PathParam | never {
    const path1AsRegExp = asRegExp(path1);
    const path2AsRegExp = asRegExp(path2);

    if (path1AsRegExp || path2AsRegExp) {
        return new RegExp((path1AsRegExp ? path1.source : path1) + (path2AsRegExp ? path2.source : path2));
    }

    return path1 + path2;
}


export function toStartWithPattern(input: PathParam): RegExp {
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


export function methodFromString(method: string): Option<HttpMethod> {
    const handers = new Map<string, Option<HttpMethod>>([
        ['GET', Some(HttpMethod.GET)],
        ['POST', Some(HttpMethod.POST)],
        ['PUT', Some(HttpMethod.PUT)],
        ['DELETE', Some(HttpMethod.DELETE)],
    ]);

    return match(
        method,
        handers,
        None(),
        false
    );
}

export function notFoundHandler() {
  return new HttpResponse({
        status: 404,
        statusText: "Not Found",
    })
}

export function CreateHttpRouter(groupRoute: GroupRoute, notFound: Action = notFoundHandler): Router {
    const routes = new Map()

    const add = (route: Route | GroupRoute, action) => {
        route.path = processPath(contactPaths(groupRoute.path, route.path));

        routes.set(route, (data: MatchedData<Option<{path: Record<string, string>}>>) => {
            const context = {
                request: data.val,
                params: data.params.flatByKey('path'),
            }
            
            return action(context);
        })
    };

    return {
        get(path, action) {
            add({ path, method: HttpMethod.GET }, action)
        },
        post(path, action) {
            add({ path, method: HttpMethod.POST }, action)
        },
        put(path, action) {
            add({ path, method: HttpMethod.PUT }, action)
        },
        delete(path, action) {
            add({ path, method: HttpMethod.DELETE }, action)
        },
        group(groupRouter: Router) {
            const groupPath = groupRouter.getGroupRoute().path;
            const startWithPattern = toStartWithPattern(groupPath);

            const action = (context: Context) => {
                return groupRouter.match(context.request);
            }

            add({ path: startWithPattern }, action);
        },
        getMapRoutes() {
            return routes;
        },
        getGroupRoute(): GroupRoute {
            return groupRoute;
        },
        getNotFoundHandler() {
            return notFound;
        },
        match(request: InputMessage) {
            return match(request, this.getMapRoutes(), this.getNotFoundHandler());
        }
    }
}
