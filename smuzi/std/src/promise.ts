import {Err, Ok, Result} from "#lib/result.js";
import {StdError, transformError} from "#lib/error.js";


export const promise = {
    async all<T extends Result>(values: Iterable<T | PromiseLike<T>>): Promise<Result<Awaited<T>[], StdError>>
    {
        return Promise.all(values)
            .then((result) => {
                return result;
            })
            .catch((error) => Err(transformError(error)));
    }
}
