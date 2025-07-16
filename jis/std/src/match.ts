import { isFunction } from "./checker.ts";

type Checker<T> = (v: T) => boolean;
type MatchHandlers<T, R> = Map<Checker<T> | unknown, R>;

export function match<R extends unknown, T , H extends MatchHandlers<T, R>>(val: T, handlers: H, deflt: R): R {
    for (const [check, res] of handlers) {
        if (isFunction(check) && check(val)) return res
    }
    return isFunction(deflt) ? deflt(val) : deflt;
}
