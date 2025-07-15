import { None, Option, Some } from "./option.ts";

type MatchHandlers<T, R> = Map<(v: T) => boolean, R>;

export function match<T,H extends MatchHandlers<T, unknown>>(val: T, handlers: H): Option<unknown> {
    for (const [check, res] of handlers) {
        if (check(val)) return Some(res)
    }
    return None()
}
