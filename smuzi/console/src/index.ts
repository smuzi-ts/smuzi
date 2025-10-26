import {isEmpty, match, panic} from "@smuzi/std";
import {ConsoleRouter, TInputCommand, TInputParams} from "#lib/router.js";
import {TConsoleConfig} from "#lib/config.ts";

export * from "#lib/output/themes/StandardThema.ts";
export * from "#lib/input-parsers/SystemInputParser.ts"
export * from "#lib/input-parsers/types.ts"
export * from "#lib/router.ts"
export * from "#lib/output/types.ts"
export * from "#lib/output/printers/StandardOutput.ts"
export * from "#lib/config.ts"


export type TNotFoundHandle = (input: TInputCommand) => never

function defaultNotFoundHandler(input: TInputCommand): never {
    panic('Command with path "' + input.path + '" not found');
}

export function handle(
    inputSource: string[],
    config: TConsoleConfig,
    notFoundHandler: TNotFoundHandle = defaultNotFoundHandler
)
{
    const inputParsed = config.inputParser(inputSource);

    if (isEmpty(inputParsed.path)) {
        config.router.getMapRoutes().forEach((action, route) => {
            console.log(route + ' - ' + action.description.someOr('no description'))
        })
        return ;
    }

    const matchedCommand = match(inputParsed.path, config.router.getMapRoutes(), () => notFoundHandler(inputParsed));

    matchedCommand.action(config.output, inputParsed.params)
}