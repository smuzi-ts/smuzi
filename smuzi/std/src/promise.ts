import {Err, Ok, Result} from "#lib/result.js";

export async function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Result<Awaited<T>[], unknown>>
{
    return Promise.all(values)
        .then((result) => Ok(result))
        .catch((error) => Err(error));
}