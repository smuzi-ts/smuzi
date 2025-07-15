import { isNone, isString } from "#std/checker.ts";
import { match } from "#std/match.ts";

type StringValuePattern = string | string[]

export class StringValue<T extends string> {
    protected _val: T;
    protected _checker: unknown;

    constructor(val: T)
    {
        this._val = val;
        let checkerHandlers = new Map([
            [isString, (val, expected) => val === expected]
        ]);
        this._checker = match(this._val, checkerHandlers);
    }

    match<M extends Map<StringValuePattern, unknown>>(mPatterns: M, _: unknown): unknown {
        for (let p in mPatterns) {
            
        }

        return _
    }
}

