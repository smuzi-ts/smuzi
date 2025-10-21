import {TInputParser} from "#lib/input-parsers/TInputParser.js";
import {match, panic} from "@smuzi/std";
import {ConsoleRouter, TInputCommand, TInputParams} from "#lib/router.js";

export * from "#lib/input-parsers/SystemInputParser.ts"
export * from "#lib/input-parsers/TInputParser.ts"
export * from "#lib/router.ts"

export type TNotFoundHandle = (input: TInputCommand) => never

function defaultNotFoundHandler(input: TInputCommand): never {
    panic('Command with path "' + input.path + '" not found');
}

export function handle(inputSource: string[], inputParser: TInputParser, router: ConsoleRouter, notFoundHandler: TNotFoundHandle = defaultNotFoundHandler)
{
    const inputParsed = inputParser(inputSource);
    const action = match(inputParsed.path, router.getMapRoutes(), () => notFoundHandler(inputParsed));

    action(inputParsed.params)
}