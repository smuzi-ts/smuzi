import {TYPE_NAME_FIELD} from "#lib/spec/schema.ts";
const TYPE_RESULT_OK = Symbol("TYPE_RESULT_OK");
const TYPE_RESULT_ERR = Symbol("TYPE_RESULT_ERR");

export const Result = {
    Ok: <T>(value: T): IResult<T, undefined> => ({
        isOk: () => true,
        val: value,
        [TYPE_NAME_FIELD]: TYPE_RESULT_OK,
    }),
    Err: <E>(err: E): IResult<undefined, E> => ({
        isOk: () => false,
        val: err,
        [TYPE_NAME_FIELD]: TYPE_RESULT_ERR,
    })
}

export type IResult<T, E> = { isOk: () => true, val: T} | {isOk: () => false, val: E};
