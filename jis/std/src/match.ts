import { None, Option, Some } from "./option.ts";
import { isFunction } from "./checker.ts";

type Checker<T> = (v: T) => boolean;
type MatchHandlers<T, R> = Map<Checker<T> | unknown, R>;

export function match<T,H extends MatchHandlers<T, unknown>>(val: T, handlers: H): Option<unknown> {
    for (const [check, res] of handlers) {
        if (isFunction(check) && check(val)) return Some(res)
    }
    return None()
}
