import { asObject } from "./checker.ts";
import { dump } from "./debug.ts";
import { panic } from "./panic.ts";

type Val = NonNullable<unknown>;
export type OptionPatterns<T , R> = { Some: (value: T) => R; None: () => R; }

export function Some<T extends Val>(value: T): Option<T> {
    return new OptionSome<T>(value);
}

export function None<T extends Val>(): Option<T> {
    return new OptionNone();
}

export class Option<T = unknown> {
    protected _val: T;
    
    match<R>(handlers: OptionPatterns<T, R>): R {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }

    isNone(): this is OptionNone {
        return this instanceof OptionNone;
    }
    
    unwrap(msg: string = "Unwrapped None variant"): T | never {
        return this.match({
            Some: (v) => v,
            None: () => panic(msg),
        });
    }

    unbox(): Option<T> | Option
    {
        if (isOption(this._val)) {
            return this._val;
        }

        return this;
    }

    get(property: string): Option {
        return this.match({
            Some: (v) => asObject(v) ? Reflect.has(v, property) ? Some(v[property]) : None() : None(),
            None: () => None(),
        });
    }

    unwrapGet(property: string): unknown | never {
        const msg = `Unwrapped None variant for property '${property}'`;

        return this.get(property).unwrap(msg);
    }

    unboxGet(property: string): Option<T> | Option {
        return this.get(property).unbox();
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