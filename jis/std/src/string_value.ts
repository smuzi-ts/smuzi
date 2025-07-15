import { isNone, isString } from "#std/checker.ts";
import { match } from "#std/match.ts";

// type StringValuePattern = string | string[]

export class StringValueType<T extends string> {
    protected _val: T;

    constructor(val: T)
    {
        this._val = val;
    }

    match<M extends Map<string | string[], Function>>(mPatterns: M, _: unknown): unknown {
        for (const [pattern, handler] of mPatterns) {
            if (isString(pattern) && pattern === this._val) {
                return handler(this._val);
            }
        }

        return _
    }
}

export function StringValue(str: string): StringValueType<string>
{
    return new StringValueType(str);
}

