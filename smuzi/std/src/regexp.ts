import {Ok, Result} from "#lib/result.js";
import {StdError} from "#lib/error.js";
import {promise} from "#lib/promise.js";
import {dump} from "#lib/debug.js";

export const regexp = {
    // async asyncReplace<E extends StdError>(
    //     str: string,
    //     regex: RegExp,
    //     asyncCallback: (...args) => Promise<Result<string, E>>): Promise<Result<string, StdError | E>> {
    //     const promises = new Array<Promise<Result<string, E>>>;
    //     const matches: unknown[] = [];
    //
    //     str.replace(regex, (...args) => {
    //         promises.push(asyncCallback(...args));
    //         matches.push(args);
    //         return ''; // временное значение
    //     });
    //
    //     return (await promise.all(promises)).mapOk(
    //         (results) => {
    //             return str.replace(regex, () => results.shift()?.okOr('') ?? '');
    //
    //     });
    // },

    async asyncReplace<E extends StdError>(
        str: string,
        reg: RegExp,
        asyncCallback: (...args) => Promise<Result<string, E>>
    ): Promise<Result<string, E | StdError>> {
        //TODO: needs optimization, one loop instead of two call "replace"
        let resultStr = '';
        let startSlice = 0;
        let matched = false;
        for (const match of str.matchAll(reg)) {
            matched = true
            const replaceResult = await asyncCallback(...match)

            if (replaceResult.isErr()) {
                return replaceResult;
            }

            replaceResult.okThen(replacement => {
                resultStr += str.slice(startSlice, match.index) + replacement;
                startSlice = match.index + match[0].length;
            })
        }

        if (! matched) {
            return Ok(str)
        }

        if (startSlice < str.length) {
            resultStr += str.slice(startSlice)
        }

        return Ok(resultStr)
    }
}