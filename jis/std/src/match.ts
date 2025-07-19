

import { isRegExp } from "node:util/types";
import { isArray, isString, isFunction, isNumber } from "./checker.ts";
import { None, Some } from "./option.ts";


type Checker<T> = (v: T) => boolean;
type Handler<T, R, A extends unknown[] = unknown[]> = (val: T, ...args: A) => R;

//>>> String
type StringValuePatterns = string | string[] | RegExp | Checker<string>;
type StringValueMapPatterns<R> = Map<StringValuePatterns, Handler<string, R> | R>

//<<<

//>>> Number
type NumberValuePatterns = number | number[] | Checker<number>;
type NumberValueMapPatterns<R> = Map<NumberValuePatterns, Handler<number, R> | R>
//<<<

//>>> Array
type ArrayValuePatterns = any[];
type ArrayValueMapPatterns<R> = Map<ArrayValuePatterns, Handler<any, R> | R>
//<<<

function matchUnknown<T extends unknown, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn: true): Handler<T, R>;

function matchUnknown<T extends unknown, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn?: false): R;

function matchUnknown<R extends unknown, T extends unknown>(
    val,
    handlers,
    deflt,
    returnAsFn = false
): R | Handler<T, R> {
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


export function match<T extends any[], R = unknown>(
    val: T, 
    handlers: ArrayValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn: true
): Handler<T, R>;

export function match<T extends any[], R = unknown>(
    val: T, 
    handlers: ArrayValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn?: false
): R;

export function match<T extends string, R = unknown>(
    val: T, 
    handlers: StringValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn: true
): Handler<T, R>;

export function match<T extends string, R = unknown>(
    val: T, 
    handlers: StringValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn?: false
): R;

export function match<T extends number, R = unknown>(
    val: T, 
    handlers: NumberValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn: true
): Handler<T, R>;

export function match<T extends number, R = unknown>(
    val: T, 
    handlers: NumberValueMapPatterns<R>,
    deflt: Handler<T, R> | R, 
    returnAsFn?: false
): R;


export function match<R, T>(
    val,
    handlers,
    deflt,
    returnAsFn: boolean = false
) {
    let matchHandler = matchUnknown;

    if (isString(val)) {
        matchHandler = matchString;
    } else if(isNumber(val)) {
        matchHandler = matchNumber;
    } else if(isArray(val)) {
        matchHandler = matchArray;
    }

    return returnAsFn ? matchHandler(val, handlers, deflt, true) : matchHandler(val, handlers, deflt, false);
}

function matchString<T extends string, R>(
    val,
    handlers,
    deflt,
    returnAsFn: boolean = false
): R | Handler<T, R> {
    let checkers = checkersForStringPattern()

    for (const [pattern, handler] of handlers) {
        let checker = matchUnknown(
            pattern,
            checkers,
            (v: T, p) => ({ res: false, data: None() }),
            true
        );

        let res = checker(val, pattern);

        if (res.res) {
            if (isFunction(handler)) {
                return returnAsFn ? handler : handler(val);
            } else {
                return handler
            }
        }
    }

    return matchFn(deflt, val, returnAsFn)
}


function matchNumber(
        val,
        handlers,
        deflt,
    returnAsFn = false) {
    let checkers = checkersForNumberPattern();

    for (const [pattern, handler] of handlers) {
        let checker = matchUnknown(
            pattern,
            checkers,
            (v, p) => ({ res: false, data: None() }),
        true);

        let res = checker(val, pattern);


        if (res.res) {
            if (isFunction(handler)) {
                return returnAsFn ? handler : handler(val);
            } else {
                return handler
            }
        }
    }


    if (isFunction(deflt)) {
        return returnAsFn ? deflt : deflt(val);
    } else {
        return deflt
    }
}

function matchArray(
    val,
    handlers,
    deflt,
    returnAsFn = false
) {
    let checkersForAnyPatterns = new Map([
        [isString, Some(checkersForStringPattern())],
        [isRegExp, Some(checkersForStringPattern())],
        [isNumber, Some(checkersForNumberPattern())],
    ]);

    for (const [patternsList, handler] of handlers) {
        let matched = true;

        for (const patternIndex in patternsList) {
            let checkerForPattern = matchUnknown(
                patternsList[patternIndex],
                checkersForAnyPatterns,
                () => None(),
                false
            );

            if (checkerForPattern.isNone()) {
                continue;
            }

            let checker = matchUnknown(
                patternsList[patternIndex],
                checkerForPattern.unwrap(),
                (v, p) => ({ res: false, data: None() }),
                true
            );

            if (val[patternIndex] == undefined) {
                matched = false;
                break;
            }

            let res = checker(val[patternIndex], patternsList[patternIndex]);

            if (! res.res) {
                matched = false;
                break;
            }
        }

        if (matched) {
            return matchFn(handler, val, returnAsFn);
        }
    }

    return matchFn(deflt, val, returnAsFn);
}

function matchFn(fnOrVar: unknown, input: unknown, returnAsFn: boolean) {
    if (isFunction(fnOrVar)) {
        return returnAsFn ? fnOrVar : fnOrVar(input);
    } else {
        return fnOrVar
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

export interface IMatched {
    match(handlers: unknown): unknown
 }

 function checkersForStringPattern()
 {
    return new Map([
        [isString, (v, p) => ({ res: p === v, data: None() })],
        [isArray, (v, p) => ({ res: p.includes(v), data: None() })],
        [isFunction, (v, p) => ({ res: p(v), data: None() })],
        [isRegExp, (v, p) => {
            const match = v.match(p);
            if (!match) return { res: false, data: None() }

            if (match.groups) {
                return { res: true, data: Some(match.groups) }
            }

            return { res: true, data: Some(match.slice(1)) }
        }]
    ]);
 }

function checkersForNumberPattern()
{
    return new Map([
        [isNumber, (v, p) => ({ res: p === v, data: None() })],
        [isArray, (v, p) => ({ res: p.includes(v), data: None() })],
        [isFunction, (v, p) => ({ res: p(v), data: None() })],
    ]);
}
