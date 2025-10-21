import {TInputCommand} from "#lib/input-parsers/TInputParser.js";
import {match, panic} from "@smuzi/std";
import {CommandAction, ConsoleRouter} from "#lib/router.js";

export * from "#lib/input-parsers/SystemInputParser.ts"
export * from "#lib/input-parsers/TInputParser.ts"
export * from "#lib/router.ts"

function defaultNotFoundHandler(path) {
    panic('Command with path ' + path + ' not found');
}

export function handle(input: TInputCommand, router: ConsoleRouter, notFoundHandler: CommandAction = defaultNotFoundHandler)
{
    const action = match(input.path, router.getMapRoutes(), defaultNotFoundHandler, true);
    action(input.params);
}