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
    StdMap, StdRecord, StdList,
} from "@smuzi/std";
import { ServerResponse } from "node:http";
import { ServerHttp2Stream } from "node:http2";


type Request = { path: string, method: HttpMethod };
type P = any;
type ActionPrimitiveResponse = P | StdMap<string> | StdRecord<any> | StdList | Record<PropertyKey, P> | Record<PropertyKey, P>[];
export type ActionResponse = void | ActionPrimitiveResponse | HttpResponse | Option<ActionPrimitiveResponse> | Result<ActionPrimitiveResponse, ActionPrimitiveResponse>;

export type Action<Resp extends THttpResponse> = (context: Context<Resp>) => ActionResponse | Promise<ActionResponse>
export type PathParam = string | RegExp;
export type ActionErrorHandler<Resp extends THttpResponse> = (context: Context<Resp>, err: any) => ActionResponse | Promise<ActionResponse>

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
 const source1 = path1AsRegExp
            ? path1.source
            : path1;

        const source2 = path2AsRegExp
            ? path2.source
            : path2;

        return new RegExp(
            "^"+(source1 + source2).replaceAll('^', '')
        );    
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
    return HttpResponse.asJson({error:"Not Found"}, 404);
}


function http2NotFoundHandler(context: Context<ServerHttp2Stream>) {
    context.response.respond({
        'content-type': 'application/json; charset=utf-8',
        ':status': 404,
    });
    context.response.end();

}



// Internal-only surface: lets a parent router recompute a child router's
// (and, recursively, its own nested groups') absolute paths after nesting.
// Not part of the public `Router` type — accessed via a narrow cast.
type Rebasable = { __rebase: (newBase: PathParam) => void };

export function CreateHttpRouter<Resp extends THttpResponse, GR extends Router<Resp>>(
    groupRoute: GroupRoute,
    notFound: Action<Resp>,
): Router<Resp> {
    const routes = new Map()

    // Every own route/subgroup is registered ONCE at startup. We additionally
    // remember each one's path *relative to this router* so that, if this
    // router later gets attached to a parent via `.group()`, we can recompute
    // every already-registered absolute path exactly once at that moment —
    // never again on every match()/request.
    const ownRoutes: { route: Route; localPath: PathParam }[] = [];
    const ownGroups: { route: GroupRoute; localGroupPath: PathParam; childRouter: Router<any> }[] = [];

    const computeAbsolute = (localPath: PathParam) =>
        processPath(contactPaths(groupRoute.path, localPath));

    const add = (route: Route, action: any) => {
        const localPath = route.path;
        route.path = computeAbsolute(localPath);
        ownRoutes.push({ route, localPath });

        routes.set(route, (routeData: RouteMatched) => {
            return {
                action,
                pathParams: routeData.params.flatByKey("path"),
            };
        })
    };

    const addGroup = (localGroupPath: PathParam, childRouter: Router<any>, action: any) => {
        const route: GroupRoute = { path: computeAbsolute(toStartWithPattern(localGroupPath)) };
        ownGroups.push({ route, localGroupPath, childRouter });
        routes.set(route, action)
    };

    // Recomputes this router's own base plus every route/subgroup registered
    // on it so far, then recurses into any already-nested group routers so
    // the whole subtree stays consistent — called once, when this router is
    // attached to a parent via `.group()`.
    const rebase = (newBase: PathParam) => {
        groupRoute.path = newBase;

        for (const entry of ownRoutes) {
            entry.route.path = computeAbsolute(entry.localPath);
        }

        for (const entry of ownGroups) {
            entry.route.path = computeAbsolute(toStartWithPattern(entry.localGroupPath));
            (entry.childRouter as unknown as Rebasable).__rebase(
                contactPaths(newBase, entry.localGroupPath)
            );
        }
    };

    const router: Router<Resp> & Rebasable = {
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
            const localGroupPath = groupRouter.getGroupRoute().path;

            addGroup(localGroupPath, groupRouter, (routeData: RouteMatched) => {
                return groupRouter.match(routeData.val);
            });

            // Re-derive every path already registered on the nested router
            // (and anything nested under IT) against our current absolute base.
            (groupRouter as unknown as Rebasable).__rebase(
                contactPaths(groupRoute.path, localGroupPath)
            );
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
        },
        __rebase: rebase,
    };

    return router;
}



export function CreateHttp1Router(
    groupRoute: GroupRoute,
    notFound: Action<ServerResponse> = http1NotFoundHandler,
): Http1Router {
    return CreateHttpRouter<ServerResponse, Http1Router>(groupRoute, notFound);
}

// export function CreateHttp2Router(
//     groupRoute: GroupRoute,
//     notFound: Action<ServerHttp2Stream> = http2NotFoundHandler
// ): Http2Router {
//     return CreateHttpRouter<ServerHttp2Stream, Http2Router>(groupRoute, notFound);
// }