import { asObject } from "./checker.js";
import { dump } from "./debug.js";
import { panic } from "./panic.js";

type Val<T = unknown> = NonNullable<T>;

export type OptionPatterns<T , R> = { Some: (value: T) => R; None: () => R; }

export function Some<T>(value: NonNullable<T>): Option<T> {
    return new OptionSome<NonNullable<T>>(value);
}

export function None(): Option<never> {
    return new OptionNone();
}

export function OptionFromNullable<T>(value: Option<T> | T): Option<T> {
    return (value === null || value === undefined) ? None()  : (isOption(value) ? value : Some(value));
}

export class Option<T = unknown> {
    protected _val: T;
    
    match<R>(handlers: OptionPatterns<T, R>): R {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }

    isNull(): this is OptionNone {
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

    get(property: string | number): Option {
        return this.match({
            Some: (v) => asObject(v) ? Reflect.has(v, property) ? OptionFromNullable(v[property]) : None() : None(),
            None: () => this,
        });
    }

    unwrapByKey(property: string | number): unknown | never {
        const msg = `Unwrapped None variant for property '${property}'`;

        return this.get(property).unwrap(msg);
    }

    flatByKey(property: string | number): Option<T> | Option {
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

export function isOption(value: unknown): value is Option {
    return value instanceof Option;
}

export function isNone(value: unknown): value is Option<never> {
    return value instanceof OptionNone;
}
