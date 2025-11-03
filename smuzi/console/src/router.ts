import {asString, None, Option} from "@smuzi/std";
import {TOutputConsole} from "#lib/output/types.ts";

export type TInputParams = Record<string, Option<string|number|boolean>>;

export type TInputCommand = {
    path: string,
    params: TInputParams,
};

export type CommandAction<P = TInputParams> = (output: TOutputConsole, params: P) => void;

export type ConsoleRoute = { path: string, description: Option<string>};
export type RouteValue = { description: Option<string>, action: CommandAction};

export type ConsoleRouter = {
    add: (route: string|ConsoleRoute, action: CommandAction) => void
    group: (groupRouter: ConsoleRouter) => void
    getMapRoutes: () => Map<string, RouteValue>
    getGroupRoute: () => ConsoleRoute
};

export function CreateConsoleRouter(groupRoute: string | ConsoleRoute = ''): ConsoleRouter
{
    const routes = new Map()

    if (asString(groupRoute)) {
        groupRoute = { path: groupRoute, description: None()}
    }

    return {
        add:(route, action) => {
            if (asString(route)) {
                route = { path: route, description: None()}
            }
            routes.set(route.path, {description: route.description, action})
        },
        group(groupRouter) {
            const groupPath = groupRouter.getGroupRoute().path;

            for (const [route, action] of groupRouter.getMapRoutes()) {
                routes.set(groupPath + route, action)
            }
        },
        getMapRoutes()
        {
            return routes;
        },
        getGroupRoute(): ConsoleRoute
        {
            return groupRoute;
        }
    }
}