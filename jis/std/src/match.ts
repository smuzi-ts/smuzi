

import { isRegExp } from "node:util/types";
import { isArray, isBool, isNone, isObject, isString, isFunction, isNumber } from "./checker.ts";
import { None, Option, Some } from "./option.ts";

type Checker<T> = (v: T) => boolean;
type Handler<T, R, A extends unknown[] = unknown[]> = (val: T, ...args: A) => R;

type IValueMatchOptions<T extends unknown, R extends unknown> = {
    val: T;
    deflt: Handler<T, R> | R;
};

type UnknownValueMatchOptions<T extends unknown, R extends unknown> = IValueMatchOptions<T, R> & {
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>;
};

//->Strings
type StringValuePatterns = string | string[] | RegExp | Checker<string>;
type StringValueMapPatterns<R> = Map<StringValuePatterns, Handler<string, R> | R>

type StringValueMatchOptions<T extends string, R extends unknown> = IValueMatchOptions<T, R> & {
    handlers: StringValueMapPatterns<R>
};
//<-Strings

//->Numbers
export type NumberValuePatterns = number | number[] | Checker<number>;
type NumberValueMapPatterns<R> = Map<NumberValuePatterns, Handler<number, R> | R>

type NumberValueMatchOptions<T extends number, R extends unknown> = IValueMatchOptions<T, R> & {
    handlers: NumberValueMapPatterns<R>
};
//<-Numbers


export function matchUnknown<T extends unknown, R = unknown>(opts: UnknownValueMatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
export function matchUnknown<T extends unknown, R = unknown>(opts: UnknownValueMatchOptions<T, R>, returnAsFn: false): R;

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


export function match<T extends string, R = unknown>(opts: StringValueMatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
export function match<T extends string, R = unknown>(opts: StringValueMatchOptions<T, R>, returnAsFn?: false): R;
export function match<T extends number, R = unknown>(opts: NumberValueMatchOptions<T, R>, returnAsFn: true): Handler<T, R>;
export function match<T extends number, R = unknown>(opts: NumberValueMatchOptions<T, R>, returnAsFn?: false): R;

export function match<R, T>(
    {
        val,
        handlers,
        deflt,
    },
    returnAsFn: boolean = false) {

    let matchHandler = matchUnknown;


    if (isString(val)) {
        matchHandler = matchString;
    } else if(isNumber(val)) {
        matchHandler = matchNumber;
    }

    return returnAsFn ? matchHandler({ val, handlers, deflt }, true) : matchHandler({ val, handlers, deflt }, false);
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


function matchNumber<T extends number, R>(
    {
        val,
        handlers,
        deflt,
    },
    returnAsFn: boolean = false): R | Handler<T, R> {
    let checkers = new Map([
        [isNumber, (v: T, p) => ({ res: p === v, data: None() })],
        [isArray, (v: T, p) => ({ res: p.includes(v), data: None() })],
        [isFunction, (v: T, p) => ({ res: p(v), data: None() })],
    ]);

    for (const [pattern, handler] of handlers) {
        let checker = matchUnknown({
            val: pattern,
            handlers: checkers,
            deflt: (v: T, p) => ({ res: false, data: None() }),
        }, true);

        let res = checker(val, pattern);

        // dump({
        //     val,
        //     pattern,
        //     checker,
        //     res
        // })
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

export function MapStringPatterns<T extends string, R = unknown>(
    handlers: [StringValuePatterns, R | Handler<T, R>][]
) {
    return new Map(handlers);
}

export function MapNumberPatterns<T extends number, R = unknown>(
    handlers: [NumberValuePatterns, R | Handler<T, R>][]
) {
    return new Map(handlers);
}