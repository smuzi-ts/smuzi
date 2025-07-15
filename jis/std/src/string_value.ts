import { isRegExp } from "node:util/types";
import { isArray, isNone, isString } from "./checker.ts";
import { match } from "./match.ts";

type MapStringPatternsType = Map<string | string[] | RegExp, Function>

export function MapStringPatterns(m: []): MapStringPatternsType {
    return new Map(m);
}

export class StringValueType<T extends string> {
    protected _val: T;

    constructor(val: T)
    {
        this._val = val;
    }

    match<M extends MapStringPatternsType>(mPatterns: M, _: (v: T) => unknown): unknown {
        let checkers = new Map([
            [isString, (v, p) => p === v],
            [isArray, (v, p) => p.includes(v)],
        ]);

        for (const [pattern, handler] of mPatterns) {
            let checker = match(pattern, checkers).unwrap()
            
        
            if (checker(this._val, pattern)) {
                return handler(this._val);
            }
        }

        return _(this._val)
    }
}

export function StringValue(str: string): StringValueType<string>
{
    return new StringValueType(str);
}

