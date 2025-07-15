import { isNone, isString } from "#std/checker";

type StringValuePattern = string | string[]

export class StringValue<T extends string> {
    protected _val: T;

    constructor(val: T)
    {
        this._val = val
    }

    match<M extends Map<StringValuePattern, unknown>>(mPatterns: M, _: unknown): unknown {
        let checker = 
        for (let p in mPatterns) {
            if (isString(this._val)) {}
        }

        return _
    }
}

