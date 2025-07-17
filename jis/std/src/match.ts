import { isFunction } from "./checker.ts";

type Checker<T> = (v: T) => boolean;
type Handler<T, R> = (val: T) => R;

type MatchOptions<T extends unknown, R  extends unknown> = {
    val: T;
    handlers: Map<Checker<T> | unknown, Handler<T, R> | R>;
    deflt: Handler<T, R> | R;
    returnAsFn?: boolean
};

export function match<R extends unknown, T extends unknown>(
    {
        val,
        handlers,
        deflt,
        returnAsFn = false
    }: MatchOptions<T, R>): R {
    for (const [check, res] of handlers) {
        if (isFunction(check) && check(val)) {
            if (isFunction(res)) {
                return returnAsFn ? (res as R) : (res as Handler<T, R>)(val);
            } else {
                return res
            }
        } else if (check === val) {

        }
    }

    if (isFunction(deflt)) {
        return returnAsFn ? (deflt as R) : (deflt as Handler<T, R>)(val);
    } else {
        return deflt
    }
}
