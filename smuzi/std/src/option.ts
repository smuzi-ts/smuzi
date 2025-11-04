import { asObject } from "./checker.js";
import { dump } from "./debug.js";
import { panic } from "./panic.js";

type Val = NonNullable<unknown>;
export type OptionPatterns<T , R> = { Some: (value: T) => R; None: () => R; }

export function Some<T extends Val>(value: T): Option<T> {
    return new OptionSome<T>(value);
}

export function None<T extends Val>(): Option<T> {
    return new OptionNone();
}

export function OptionFromNullable<T>(value: T | Option<T>): Option<T> {
    return (value === null || value === undefined) ? None() : (isOption(value) ? value : Some(value));
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

    flat(): Option<T> | Option
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

    unwrapByKey(property: string): unknown | never {
        const msg = `Unwrapped None variant for property '${property}'`;

        return this.get(property).unwrap(msg);
    }

    flatByKey(property: string): Option<T> | Option {
        return this.get(property).flat();
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


export function isOption<T = unknown>(value: unknown): value is Option<T> {
    return value instanceof Option;
}
