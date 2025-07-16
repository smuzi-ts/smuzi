import { panic } from "./panic.ts";

export function Some<T>(value: T): Option<T> {
    return new OptionSome<T>(value);
}

export function None(): Option<never> {
    return new OptionNone();
}

export class Option<T> {
    protected _val: T;
    
    match<S,N>(handlers: { Some: (value: T) => S; None: () => N; }): S | N {
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

    someOr<N>(none: N): T | N {
        return this.match({
            Some: (v) => v,
            None: () => none,
        });
    }
}


class OptionSome<T> extends Option<T> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class OptionNone  extends Option<never>{
    constructor() {
        super();
    }
}


export function isOption(value: unknown): value is Option<unknown> {
    return value instanceof Option;
}