import { asFunction, asNull, asObject } from "./checker.js";
import { panic } from "./panic.js";
import {dump} from "#lib/debug.js";

type Val<T = unknown> = NonNullable<T>;

export type OptionPatterns<T , R> = { Some: (value: T) => R; None: () => R; }

export function Some<T>(value: NonNullable<T>): Option<T> {
    return new OptionSome<NonNullable<T>>(value);
}

export function None(): Option<never> {
    return new OptionNone();
}

export function OptionFromNullable<T>(value: Option<T> | T): Option<T extends null | undefined ? never : T> {
    return asNull(value) ? None()  : (isOption(value) ? value  : Some(value as NonNullable<T>)) as any;
}

export class Option<T = unknown> {
    protected _val: T;
    
    match<R>(handlers: OptionPatterns<T, R>): R {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }

    someOrNone<R>(some: ((value: T) => R) | R, none: (() => R) | R): R {
        if (this instanceof OptionSome) {
            return asFunction(some) ? some(this._val as T) : some;
        }
        
        return asFunction(none) ? none() : none;
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

    flat(): this | T
    {
        if (isOption(this._val)) {
            return this._val;
        }

        return this;
    }

    get<K extends Extract<keyof T, string>>(property: K): Option<T[K] | never> {
        return this.match({
            Some: (v) => asObject(v) ? Reflect.has(v, property) ? OptionFromNullable(v[property]) : None() : None(),
            None: () => None(),
        });
    }

    unwrapByKey<K extends Extract<keyof T, string>>(property: K): T[K] | never {
        const msg = `Unwrapped None variant for property '${property}'`;

        return this.get(property).unwrap(msg);
    }

    flatByKey<K extends Extract<keyof T, string>>(property: K): Option<T[K]> | T[K] {
        return this.get(property).flat();
    }


    someOr(none: T): T {
        return this.match({
            Some: (v) => v,
            None: () => none,
        });
    }

    mapSome<R extends NonNullable<unknown>>(handler: (value: T) => R): Option<R | never> {
        if (isSome(this)) {
            return Some(handler(this._val));
        }
    
        return None();
    }

    someThen(handler: (value: T) => void): void {
        if (isSome(this)) {
            handler(this._val);
        }
    }

    async asyncMapSome<R extends NonNullable<unknown>>(argumentsForSome: Option = None()): Promise<Option<R | never>> {
        if (isSome(this)) {
            return asFunction(this._val) ? OptionFromNullable(await this._val(argumentsForSome)) : this as unknown as Option<R>;
        }
    
        return None();
    }

    dump() {
        dump({innerVal: this._val});
        return this;
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

export function isSome(value: unknown): value is Option<unknown> {
    return value instanceof OptionSome;
}


export function isNone(value: unknown): value is Option<never> {
    return value instanceof OptionNone;
}
