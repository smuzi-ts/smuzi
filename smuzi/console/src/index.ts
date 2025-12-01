import {dump, isEmpty, match, panic} from "@smuzi/std";
import {ConsoleRouter, TInputCommand} from "#lib/router.js";
import {TConsoleConfig} from "#lib/config.js";

export * from "#lib/output/themes/StandardThema.js";
export * from "#lib/input-parsers/SystemInputParser.js"
export * from "#lib/input-parsers/types.js"
export * from "#lib/router.js"
export * from "#lib/output/types.js"
export * from "#lib/output/printers/StandardOutput.js"
export * from "#lib/config.js"
export * from "#lib/command.js"

export type TNotFoundHandle = (input: TInputCommand) => never

function defaultNotFoundHandler(input: TInputCommand): never {
    panic('Command with path "' + input.path + '" not found');
}

export async function commandHandler(
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

    await matchedCommand.action(config.output, inputParsed.params)
}

