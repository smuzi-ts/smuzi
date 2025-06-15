export const Result = {
    Ok: <T>(value: T): IResult<T, undefined> => ({
        isOk: true,
        val: value,
    }),
    Err: <E>(err: E): IResult<undefined, E> => ({
        isOk: false,
        val: err,
    })
}

export type IResult<T, E> = { isOk: true, val: T} | {isOk: false, val: E};
