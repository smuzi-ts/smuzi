import { None, Option, Some } from "./option.ts";

type MatchHandlers = Map<Function, unknown>;

export function matchExp<H extends MatchHandlers>(val: unknown, handlers: H): Option<unknown> {
    for (const [check, res] of handlers) {
        if (check(val)) return Some(res)
    }
    return None()
}