import {dump, isEmpty, match, panic} from "@smuzi/std";
import {ConsoleRouter, TInputCommand} from "./router.js";
import {TConsoleConfig} from "./config.js";

export * from "./output/themes/StandardThema.js";
export * from "./input-parsers/SystemInputParser.js"
export * from "./input-parsers/types.js"
export * from "./router.js"
export * from "./output/types.js"
export * from "./output/printers/StandardOutput.js"
export * from "./config.js"
export * from "./command.js"

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

