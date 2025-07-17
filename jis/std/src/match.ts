// import { isBool, isFunction } from "./checker.ts";

// type Checker<T> = (v: T) => boolean;
// type Handler<T, R, A extends unknown[] = unknown[]> = (val: T, ...args: A) => R;

// type MatchOptions<T extends unknown, R  extends unknown> = {
//     val: T;
//     handlers: Map<Checker<T> | unknown, Handler<T, R> | R>;
//     deflt: Handler<T, R> | R;
// };

// export function match<T, R>(opts: MatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
// export function match<T, R>(opts: MatchOptions<T, R>, returnAsFn?: false): R;

// export function match<R extends unknown, T extends unknown>(
//     {
//         val,
//         handlers,
//         deflt,
//     }: MatchOptions<T, R>,
//     returnAsFn = false): R | Handler<T, R> {
//     for (const [check, res] of handlers) {
//         if (isFunction(check) ? check(val) : check === val ) {
//             if (isFunction(res)) {
//                 return returnAsFn ? (res as Handler<T, R>) : (res as Handler<T, R>)(val);
//             } else {
//                 return (res as R)
//             }
//         }
//     }

//     if (isFunction(deflt)) {
//         return returnAsFn ? deflt  as Handler<T, R> : (deflt as Handler<T, R>)(val);
//     } else {
//         return (deflt as R)
//     }
// }

import { isRegExp } from "node:util/types";
import { isArray, isBool, isNone, isObject, isString, isFunction } from "./checker.ts";
import { None, Option, Some } from "./option.ts";
import { dump } from "./debug.ts";

type Checker<T> = (v: T) => boolean;
type Handler<T, R, A extends unknown[] = unknown[]> = (val: T, ...args: A) => R;

type UnknownValueMatchOptions<T extends unknown, R extends unknown> = {
    val: T;
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>;
    deflt: Handler<T, R> | R;
};


type StringValueMapPatterns<T, R> = Map<string | string[] | RegExp, Handler<T, R> | R>

type StringValueMatchOptions<T, R extends unknown> = {
    val: T;
    handlers: StringValueMapPatterns<T, R>
    deflt: Handler<T, R> | R;
};

export function match<T extends string, R = unknown>(opts: StringValueMatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
export function match<T extends string, R = unknown>(opts: StringValueMatchOptions<T, R>, returnAsFn: false): R;

export function matchUnknown<T extends unknown, R = unknown>(opts: UnknownValueMatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
export function matchUnknown<T extends unknown, R = unknown>(opts: UnknownValueMatchOptions<T, R>, returnAsFn: false): R;

// export function match<T extends Option<unknown>, R>(opts: MatchOptions<T, R>, returnAsFn?: false): R;

export function matchUnknown<R extends unknown, T extends unknown>(
    {
        val,
        handlers,
        deflt,
    },
    returnAsFn: boolean = false): R | Handler<T, R> {
    for (const [check, res] of handlers) {
        if (isFunction(check) ? check(val) : check === val) {
            if (isFunction(res)) {
                return returnAsFn ? (res as Handler<T, R>) : (res as Handler<T, R>)(val);
            } else {
                return (res as R)
            }
        }
    }

    if (isFunction(deflt)) {
        return returnAsFn ? deflt as Handler<T, R> : (deflt as Handler<T, R>)(val);
    } else {
        return (deflt as R)
    }
}

export function match<R, T>(
    {
        val,
        handlers,
        deflt,
    },
    returnAsFn: boolean = false) {

    if (typeof val === "string") {
        return matchString({ val, handlers, deflt }, returnAsFn);
    }

    return matchUnknown({ val, handlers, deflt }, returnAsFn);
}

function matchString<T extends string, R>(
    {
        val,
        handlers,
        deflt,
    },
    returnAsFn: boolean = false): R | Handler<T, R> {
    let checkers = new Map([
        [isString, (v: T, p) => ({ res: p === v, data: None() })],
        [isArray, (v: T, p) => ({ res: p.includes(v), data: None() })],
        [isFunction, (v: T, p) => ({ res: p(v), data: None() })],
        [isRegExp, (v: T, p) => {
            const match = v.match(p);
            if (!match) return { res: false, data: None() }

            if (match.groups) {
                return { res: true, data: Some(match.groups) }
            }

            return { res: true, data: Some(match.slice(1)) }
        }]
    ]);

    for (const [pattern, handler] of handlers) {
        let checker = matchUnknown({
            val: pattern,
            handlers: checkers,
            deflt: (v: T, p) => ({ res: false, data: None() }),
        }, true);

        let res = checker(val, pattern);

        if (res.res) {
            if (isFunction(handler)) {
                return returnAsFn ? handler as Handler<T, R> : (handler as Handler<T, R>)(val);
            } else {
                return (handler as R)
            }
        }
    }


        if (isFunction(deflt)) {
            return returnAsFn ? deflt as Handler<T, R> : (deflt as Handler<T, R>)(val);
        } else {
            return (deflt as R)
        }

}
