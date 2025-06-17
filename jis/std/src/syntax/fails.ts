import {isString} from "#lib/utils.js";

export function failIf(condition: boolean, exceptionOrMsg: ExceptionOrMsg): void|never {
    if (condition) throw (isString(exceptionOrMsg) ? UndefinedException.build(exceptionOrMsg) : exceptionOrMsg);
}