import { IMatched } from "./match.ts";
import { panic } from "./panic.ts";

type Val = NonNullable<unknown>;
export type OptionPatterns<T, R> = { Some: (value: T) => R; None: () => R; }

export function Some<T extends Val>(value: T): Option<T> {
    return new OptionSome<T>(value);
}

export function None<T extends Val>(): Option<T> {
    return new OptionNone();
}

export class Option<T> implements IMatched {
    protected _val: T;
    
    match<R>(handlers: OptionPatterns<T, R>): R {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }

    unwrap(): T | never {
        return this.match({
            Some: (v) => v,
            None: () => panic("Unwrapped None variant"),
        });
    }

    someOr(none: T): T {
        return this.match({
            Some: (v) => v,
            None: () => none,
        });
    }
}


class OptionSome<T extends Val> extends Option<T> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class OptionNone extends Option<never>{
    constructor() {
        super();
    }
}


export function isOption(value: unknown): value is Option<unknown> {
    return value instanceof Option;
}