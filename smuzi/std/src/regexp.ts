import {Ok, Result} from "#lib/result.js";
import {StdError} from "#lib/error.js";
import {promise} from "#lib/promise.js";
import {dump} from "#lib/debug.js";

export const regexp = {
    async asyncReplace<E extends StdError>(
        str: string,
        regex: RegExp,
        asyncCallback: (...args) => Promise<Result<string, E>>
    ): Promise<Result<string, E | StdError>> {
        //TODO: needs optimization, one loop instead of two call "replace"
        const promises = new Array<Promise<Result<string, E>>>;

        str.replace(regex, (...args) => {
            promises.push(asyncCallback(...args));
            return '';
        });

        const res = (await promise.all(promises));
        return res.mapOk(
            (results) => {
                let index = 0;
                return  str.replace(regex, () => results[index++].okOr(''));
        });

    }
}