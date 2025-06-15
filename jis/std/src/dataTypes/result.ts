export const Result = {
    Ok: <T>(value: T): IResult<T, undefined> => ({
        isOk: true,
        ok: value,
        err: undefined,
    }),
    Err: <E>(err: E): IResult<undefined, E> => ({
        isOk: false,
        ok: undefined,
        err,
    })
}

export type IResult<T, E> = { isOk: true, ok: T, err: undefined} | {isOk: false, ok: undefined, err: E};
