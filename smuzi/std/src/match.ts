import { isRegExp, isArray, isString, isFunction, isNumber, isObject, asFunction } from "./checker.js";
import { dump } from "./debug.js";
import { None, Option, Some } from "./option.js";


type Checker<T> = (v: T) => boolean;
type Handler<T, R, A extends unknown[] = unknown[]> = (val: T, ...args: A) => R;

//>>> String
export type StringValuePatterns = string | string[] | RegExp | Checker<string>;
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

export type ParamsMatchedData = Option<unknown | Record<string, Option<unknown>>>;

export type MatchedData = {
    val,
    pattern: Option<unknown | Record<string, Option<unknown>>>,
    params: ParamsMatchedData,
};

export function matchUnknown<T extends unknown, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn: true): Handler<T, R>;

export function matchUnknown<T extends unknown, R = unknown>(
    value: T,
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>, 
    deflt: Handler<T, R> | R, 
    returnAsFn?: false): R;

export function matchUnknown<R extends unknown, T extends unknown>(
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
): R;

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
    const matchHandler = matchUnknown(val, new Map([
        [(v) => isString(v) || isNumber(v), matchPrimitive],
        [(v) => isArray(v) || isObject(v), matchObj],
    ]), matchUnknown, true);

   return matchHandler(val, handlers, deflt, returnAsFn);
}

function matchPrimitive<T extends string|number, R>(
    val,
    handlers,
    deflt,
    returnAsFn: boolean = false
): R | Handler<T, R> {
    for (const [pattern, handler] of handlers) {
      const res = matchChecherForPattern(pattern) (val, pattern)
      if (res.res) return matchFn(handler, {val, pattern: Some(pattern), params: res.params}, returnAsFn)
    }

    return matchFn(deflt, {val, pattern: None(), params: None()}, returnAsFn)
}

function matchObj(
    val,
    handlers,
    deflt,
    returnAsFn = false
) {
    for (const [patternsList, handler] of handlers) {
        let matched = true;

        const params = {};

        for (const patternIndex in patternsList) {
            params[patternIndex] = None();
            
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

            params[patternIndex] = res.params;
        }

     
        if (matched) {
            return matchFn(handler, {val, patterns: Some(patternsList), params: Some(params)} , returnAsFn);
        }
    }

    return matchFn(deflt, {val, patterns: None(), params: None()}, returnAsFn);
}

function matchFn(fnOrVar: unknown, input: unknown, returnAsFn: boolean) {
    if (asFunction(fnOrVar)) {
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
   params: Option<Record<string, string> | string[]>,
 };
 

 function matchChecherForPattern(pattern: unknown) {
    return matchUnknown(
        pattern,
        checkersForPatterns(),
        (v, p) => ({ res: false, params: None() }),
        true
    );
 }

 function checkPatternAsString(v, p)
 {
   return { res: p === v, params: None() }
 }

function checkPatternAsNumber(v, p)
 {
   return { res: p === v, params: None() }
 }

 function checkPatternAsFunction(v, p)
 {
   return { res: p(v), params: None() }
 }

function checkPatternAsArray(v, p)
 {
   return { res: p.includes(v), params: None() }

}

 function checkPatternAsRegExp(v, p)
 {
    const match = v.match(p);
    if (! match) return { res: false, params: None() }

    if (match.groups) {
        return { res: true, params: Some(match.groups) }
    }

    return { res: true, params: Some(match.slice(1)) }
 }

 function checkersForPatterns()
 {
    return new Map<Function, (v, p) => MatchResult>([
        [isString, checkPatternAsString],
        [isNumber, checkPatternAsNumber],
        [isFunction, checkPatternAsFunction],
        [isArray, checkPatternAsArray],
        [isRegExp, checkPatternAsRegExp]
    ]);
 }
