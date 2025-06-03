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
    addRoute({method: "GET", path}, handler);
}

export function routesHandler(context, response) {
    const routeKey = generateRouteKey({
        method: context.request().method ?? "GET",
        path: context.request().path ?? ''
    });

    const handler = routes[routeKey]?.handler;

    if (handler !== undefined) {
        return handler(context, response)
    } else {
        throw new Error('Not Found 404')
    }

}

export const router = {
    get,
}
