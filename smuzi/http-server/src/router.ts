import {
    asRegExp,
    asString,
    match,
    MatchedData,
    None,
    Option,
    Some,
    HttpMethod,
    HttpRequest,
    Result,
    HttpResponse,
    StdError,
    StdRecord,
    StdMap,
} from "@smuzi/std";
import { ServerResponse } from "node:http";
import { ServerHttp2Stream } from "node:http2";


type Request = { path: string, method: HttpMethod };
type P = string | number | StdError | string[] | number[];
type ActionPrimitiveResponse = P | StdRecord<string, P> | Record<string, P> | Record<string, P>[];
export type ActionResponse = void | ActionPrimitiveResponse | HttpResponse | Option<ActionPrimitiveResponse> | Result<ActionPrimitiveResponse, ActionPrimitiveResponse>;

export type Action<Resp extends THttpResponse> = (context: Context<Resp>) => ActionResponse | Promise<ActionResponse>
export type PathParam = string | RegExp;

type THttpResponse = ServerResponse | ServerHttp2Stream
type Route = { path: PathParam, method: HttpMethod };
type GroupRoute = { path: PathParam };
type RouteMatched = MatchedData<Request, Option<{ path: Record<string, string> }>>
type RouteMatchResult<Resp extends THttpResponse> = {
    action: Action<Resp>,
    pathParams: Option<Record<string, string | number | boolean>>
}

export type Router<Resp extends THttpResponse, A = Action<Resp>> = {
    group: (groupRouter: Router<Resp>) => void
    getMapRoutes: () => Map<Route, (routeData: RouteMatched) => RouteMatchResult<Resp>>
    getGroupRoute(): GroupRoute
    get: (path: PathParam, action: A) => void
    post: (path: PathParam, action: A) => void
    put: (path: PathParam, action: A) => void
    delete: (path: PathParam, action: A) => void
    match: (request: Request) => RouteMatchResult<Resp>
}

export type Http1Router = Router<ServerResponse>;
export type Http2Router = Router<ServerHttp2Stream>;

export type Context<Resp extends THttpResponse, Params = unknown,> = {
    request: HttpRequest,
    response: Resp,
    pathParams: Params,
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

function http1NotFoundHandler(context: Context<ServerResponse>) {
    context.response.writeHead(404, "Not Found");
    context.response.end();
}

function http2NotFoundHandler(context: Context<ServerHttp2Stream>) {
    context.response.respond({
        'content-type': 'application/json; charset=utf-8',
        ':status': 404,
    });
    context.response.end();

}

function CreateHttpRouter<Resp extends THttpResponse, GR extends Router<Resp>>(
    groupRoute: GroupRoute,
    notFound: Action<Resp>
): Router<Resp> {
    const routes = new Map()

    const add = (route: Route, action: any) => {
        route.path = processPath(contactPaths(groupRoute.path, route.path));

        routes.set(route, (routeData: RouteMatched) => {
            return {
                action,
                pathParams: routeData.params.flatByKey("path"),
            };
        })
    };

    const addGroup = (route: GroupRoute, action: any) => {
        route.path = processPath(contactPaths(groupRoute.path, route.path));

        routes.set(route, action)
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
        group(groupRouter: GR) {
            const groupPath = groupRouter.getGroupRoute().path;
            const startWithPattern = toStartWithPattern(groupPath);

            addGroup({ path: startWithPattern }, (routeData: RouteMatched) => {
                return groupRouter.match(routeData.val);
            });
        },
        getMapRoutes() {
            return routes;
        },
        getGroupRoute(): GroupRoute {
            return groupRoute;
        },
        match(request: Request) {
            return match(request, this.getMapRoutes(), (routeData: RouteMatched) => {
                return {
                    action: notFound,
                    pathParams: routeData.params.flatByKey("path"),
                } as RouteMatchResult<Resp>;
            })
        }
    }
}


export function CreateHttp1Router(
    groupRoute: GroupRoute,
    notFound: Action<ServerResponse> = http1NotFoundHandler
): Http1Router {
    return CreateHttpRouter<ServerResponse, Http1Router>(groupRoute, notFound);
}

export function CreateHttp2Router(
    groupRoute: GroupRoute,
    notFound: Action<ServerHttp2Stream> = http2NotFoundHandler
): Http2Router {
    return CreateHttpRouter<ServerHttp2Stream, Http2Router>(groupRoute, notFound);
}