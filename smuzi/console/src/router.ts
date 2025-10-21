import {TInputParams} from "#lib/input-parsers/TInputParser.js";
import {MathedData} from "@smuzi/std";

export type CommandAction = <P extends TInputParams>(params: P) => void;

export type PathParam = string;
export type ConsoleRoute = {path: PathParam};

export type ConsoleRouter = {
    group: (groupRouter: ConsoleRouter) => void
    getMapRoutes: () => Map<ConsoleRoute, CommandAction>
    getGroupRoute: () => ConsoleRoute
};

export function CreateConsoleRouter(groupRoute: ConsoleRoute): ConsoleRouter
{
    const routes = new Map()

    const add =  (route, action) => {
        routes.set(route.path, (data: MathedData) => {
            return action(data.val);
        })
    };

    return {
        group(groupRouter) {
            const groupPath = groupRouter.getGroupRoute().path;

            for (const [route, action] of groupRouter.getMapRoutes()) {
                add(groupPath + route.path, action)
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