import { asFunction, asNull, asObject } from "./checker.js";
import { panic } from "./panic.js";
import {dump} from "#lib/debug.js";

type Val<T = unknown> = NonNullable<T>;

export type OptionPatterns<T , R> = { Some: (value: T) => R; None: () => R; }

export function Some<T>(value: NonNullable<T>): Option<T> {
    return new OptionSome<NonNullable<T>>(value);
}

export function None<T = unknown>(): Option<never> | Option<T> {
    return new OptionNone();
}

export function OptionFromNullable<T, I = T extends null | undefined ? never : T>(value: Option<T> | T): I extends Option<infer U> ? I : Option<I> {
    return asNull(value) ? None() : (isOption(value) ? value  : Some(value as NonNullable<T>)) as any;
}

export class Option<T = unknown> {
    unsafeSource(): T {
        return this._val;
    }

    protected _val: T;

    match<R>(handlers: OptionPatterns<T, R>): R {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }


    async asyncMatch<R>(handlers: OptionPatterns<T, R>): Promise<R> {
        if (this instanceof OptionSome) {
            return await handlers.Some(this._val as T);
        }

        return await handlers.None();
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

    isSome(): this is OptionSome {
        return this instanceof OptionSome;
    }

    unwrap(msg: string = "Unwrapped None variant"): T | never {
        return this.match({
            Some: (v) => v,
            None: () => panic(msg),
        });
    }

    flat(): this | T {
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

        return this;
    }

    mapNone<R extends NonNullable<unknown>>(handler: () => R): Option<R | T> {
        if (isNone(this)) {
            return Some(handler());
        }

        return this;
    }

    someThen<R extends NonNullable<unknown>>(handler: (value: T) => R | void): R | void {
        if (isSome(this)) {
            return handler(this._val);
        }
    }

    async asyncSomeThen(handler: (value: T) => Promise<void>): Promise<void> {
        if (isSome(this)) {
            await handler(this._val);
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

    isZero(): boolean {
        return this._val == 0;
    }

    equal(val: unknown): boolean {
        if (isNone(this)) {
            return isNone(val) || val == null || val == undefined;
        }
        
        if(isOption(val)) {
            return val.match({
                Some: val_inner => val_inner == this._val,
                None: () => isNone(this)
            })
        }

        return val == this._val;
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

//TODO: Deprecated, use asNone() instead of
export function isNone(value: unknown): value is Option<never> {
    return value instanceof OptionNone;
}

export function asNone(value: unknown): value is Option<never> {
    return value instanceof OptionNone;
}
