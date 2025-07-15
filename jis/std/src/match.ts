import { None, Option, Some } from "./option.ts";

type MatchHandlers<T> = Map<(v: T) => boolean, unknown>;

export function match<T,H extends MatchHandlers<T>>(val: T, handlers: H): Option<unknown> {
    for (const [check, res] of handlers) {
        if (check(val)) return Some(res)
    }
    return None()
}
