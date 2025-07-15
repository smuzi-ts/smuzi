import { isArray, isNone, isString } from "./checker.ts";
import { match } from "./match.ts";
import { echo } from "./debug.ts";

type MapStringPatternsType = Map<string | string[], Function>

export function MapStringPatterns(m): MapStringPatternsType {
    return new Map(m);
}

export class StringValueType<T extends string> {
    protected _val: T;

    constructor(val: T)
    {
        this._val = val;
    }

    match<M extends MapStringPatternsType>(mPatterns: M, _: unknown): unknown {
        let checkers = new Map([
            [isString, (v, p) => p === v],
            [isArray, (v, p) => p.includes(v)]
        ]);

        for (const [pattern, handler] of mPatterns) {
            let checker = echo(match(pattern, checkers))
            
            if (checker) {
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

