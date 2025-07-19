

import { isRegExp } from "node:util/types";
import { isArray, isString, isFunction, isNumber, isObject } from "./checker.ts";
import { None, Option, Some } from "./option.ts";
import { dd, dump } from "./debug.ts";


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
            return matchFn(res, val, returnAsFn);
        }
    }

    return matchFn(deflt, val, returnAsFn);
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


export function match<T extends Record<string, unknown>, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn: true): Handler<T, R>;

export function match<T extends Record<string, unknown>, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn?: false): R;

export function match<R, T>(
    val,
    handlers,
    deflt,
    returnAsFn: boolean = false
) {
    let matchHandler = matchUnknown(val, new Map([
        [(v) => isString(v) || isNumber(v), matchPrimitive],
        [(v) => isArray(v) || isObject(v), matchObj],
    ]), matchUnknown, true);

    return returnAsFn ? matchHandler(val, handlers, deflt, true) : matchHandler(val, handlers, deflt, false);
}

function matchPrimitive<T extends string|number, R>(
    val,
    handlers,
    deflt,
    returnAsFn: boolean = false
): R | Handler<T, R> {
    for (const [pattern, handler] of handlers) {
      const checker = matchChecherForPattern(pattern)
      if (checker(val, pattern).res) return matchFn(handler, val, returnAsFn)
    }

    return matchFn(deflt, val, returnAsFn)
}

function matchObj(
    val,
    handlers,
    deflt,
    returnAsFn = false
) {
    for (const [patternsList, handler] of handlers) {
        let matched = true;

        for (const patternIndex in patternsList) {
            if (val[patternIndex] == undefined) {
                matched = false;
                break;
            }

            const checker = matchChecherForPattern(patternsList[patternIndex])
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


 type MatchResult = {
   res: boolean,
   data: Option<Record<string, string> | string[]>,
 };
 

 function matchChecherForPattern(pattern: unknown) {
    return matchUnknown(
        pattern,
        checkersForPatterns(),
        (v, p) => ({ res: false, data: None() }),
        true
    );
 }

 function checkPatternAsString(v, p)
 {
   return { res: p === v, data: None() }
 }

function checkPatternAsNumber(v, p)
 {
   return { res: p === v, data: None() }
 }

 function checkPatternAsFunction(v, p)
 {
   return { res: p(v), data: None() }
 }

function checkPatternAsArray(v, p)
 {
   return { res: p.includes(v), data: None() }
 }

 function checkPatternAsRegExp(v, p)
 {
    const match = v.match(p);
    if (!match) return { res: false, data: None() }

    if (match.groups) {
        return { res: true, data: Some(match.groups) }
    }

    return { res: true, data: Some(match.slice(1)) }
 }

 function checkersForPatterns(): Map<Function, (v, p) => MatchResult>
 {
    return new Map([
        [isString, checkPatternAsString],
        [isNumber, checkPatternAsNumber],
        [isFunction, checkPatternAsFunction],
        [isArray, checkPatternAsArray],
        [isRegExp, checkPatternAsRegExp]
    ]);
 }

