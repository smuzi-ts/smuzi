import { isRegExp } from "node:util/types";
import { isArray, isBool, isNone, isObject, isString } from "./checker.ts";
import { match } from "./match.ts";
import { None, Option, Some } from "./option.ts";

type CheckerResult = {
    res: boolean,
    data: Option<unknown>
}
type Checker<T> = (v: T) => boolean;
type CheckerFn<T> = (v: T, p: any) => CheckerResult;

type MapStringPatternsType = Map<string | string[] | RegExp, Function>

export function MapStringPatterns(m): MapStringPatternsType {
    return new Map(m);
}

export class StringValueType<T extends string> {
    protected _val: T;

    constructor(val: T) {
        this._val = val;
    }

    match<M extends MapStringPatternsType>(mPatterns: M, _: (v: T) => unknown): unknown {
        let checkers = new Map<Checker<T>, CheckerFn<T>>([
            [isString, (v: T, p) => ({ res: p === v, data: None() })],
            [isArray, (v: T, p) => ({ res: p.includes(v), data: None() })],
            [isRegExp, (v: T, p) => {
                const match = v.match(p);
                if (! match) return { res: false, data: None() }

                if (match.groups) {
                    return { res: true, data: Some(match.groups) }
                }

                return { res: true, data: Some(match.slice(1)) }
            }]
        ]);

        for (const [pattern, handler] of mPatterns) {
            let checker = match(pattern, checkers, (v, p) => false);
            let res = checker(this._val, pattern);
            if (res.res) {
                return handler(res.data);
            }
        }

        return _(this._val)
    }
}

export function StringValue(str: string): StringValueType<string> {
    return new StringValueType(str);
}

