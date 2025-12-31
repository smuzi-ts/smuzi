import {Ok, Result} from "#lib/result.js";
import {StdError} from "#lib/error.js";
import {promise} from "#lib/promise.js";
import {dump} from "#lib/debug.js";

export const regexp = {
    async asyncReplace<E extends StdError>(str: string, regex: RegExp, asyncCallback: (...args) => Promise<Result<string, E>>): Promise<Result<string, E>> {
        const promises = new Array<Promise<Result<string, E>>>;
        const matches: unknown[] = [];

        str.replace(regex, (...args) => {
            promises.push(asyncCallback(...args));
            matches.push(args);
            return ''; // временное значение
        });

        return (await promise.all(promises)).mapOk(
            (results) => {
            dump({
                str,
                regex,
                results
            });
        });

        let index = 0;

        return  Ok(str.replace(regex, () => results[index++].okOr('')));
    }
}