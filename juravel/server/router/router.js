let routes =  {};

function generateRouteKey(routeItem) {
    return  [routeItem.method, routeItem.path].join('__');
}

function addRoute(routeItem , handler)
{
    const key = generateRouteKey(routeItem);
    routes[key] = Object.assign(routeItem, {handler});
}

/**
 * Add route with method "GET"
 */
function get(path, handler)
{
    addRoute({method: HttpMethod.GET, path}, handler);
}

export const routesHandler: HttpRouteHandler = (context: HttpContext): HttpResponse | {} | string  => {
    const routeKey = generateRouteKey({
        method: context.request().method ?? HttpMethod.GET,
        path: context.request().path ?? ''
    });

    const handler: HttpRouteHandler|undefined = routes[routeKey]?.handler;

    if (handler !== undefined) {
        return handler(context)
    } else {
        throw new Error('Not Found 404')
    }

}


export const router = {
    get,
}