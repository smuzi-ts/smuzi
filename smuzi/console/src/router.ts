import {TInputParams} from "#lib/input-parsers/TInputParser.js";

export type CommandAction = <P extends TInputParams>(params: P) => void;

export type ConsoleRoute = string;

export type ConsoleRouter = {
    add: (route: ConsoleRoute, action: CommandAction) => void
    group: (groupRouter: ConsoleRouter) => void
    getMapRoutes: () => Map<ConsoleRoute, CommandAction>
    getGroupRoute: () => ConsoleRoute
};

export function CreateConsoleRouter(groupRoute: ConsoleRoute = ''): ConsoleRouter
{
    const routes = new Map()

    return {
        add:(route, action) => {
            routes.set(route, action)
        },
        group(groupRouter) {
            const groupPath = groupRouter.getGroupRoute();

            for (const [route, action] of groupRouter.getMapRoutes()) {
                this.add(groupPath + route, action);
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