import {TInputParser} from "#lib/input-parsers/TInputParser.js";
import {isEmpty, match, panic} from "@smuzi/std";
import {ConsoleRouter, TInputCommand, TInputParams} from "#lib/router.js";

export * from "#lib/input-parsers/SystemInputParser.ts"
export * from "#lib/input-parsers/TInputParser.ts"
export * from "#lib/router.ts"

export type TNotFoundHandle = (input: TInputCommand) => never

function defaultNotFoundHandler(input: TInputCommand): never {
    panic('Command with path "' + input.path + '" not found');
}

export function handle(
    inputSource: string[],
    inputParser: TInputParser,
    router: ConsoleRouter,
    notFoundHandler: TNotFoundHandle = defaultNotFoundHandler
)
{
    const inputParsed = inputParser(inputSource);

    if (isEmpty(inputParsed.path)) {
        router.getMapRoutes().forEach((action, route) => {
            console.log(route + ' - ' + action.description.someOr('no description'))
        })
        return ;
    }

    const matchedCommand = match(inputParsed.path, router.getMapRoutes(), () => notFoundHandler(inputParsed));

    matchedCommand.action(inputParsed.params)
}