import {Err, Ok, Result} from "./result.js";
import {StdError, transformError} from "./error.js";


export const promise = {
    async all<T extends Result>(values: Iterable<T | PromiseLike<T>>): Promise<Result<Awaited<T>[], StdError>>
    {
        return Promise.all(values)
            .then((result) => {
                return Ok(result);
            })
            .catch((error) => Err(transformError(error)));
    }
}
