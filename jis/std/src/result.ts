import { isString } from "./checker.ts";
import { panic } from "./panic.ts";

type Val = NonNullable<unknown>;

export function Ok<T extends Val>(value: T): Result<T, never> {
    return new ResultOk<T>(value);
}

export function Err<E extends Val>(error: E): Result<never, E> {
    return new ResultErr<E>(error);
}

export class Result<T, E> {
    protected _val: T | E;

    match<Ok, Err>(handlers: { Ok: (value: T) => Ok; Err: (error: E) => Err; }): Ok | Err {
        if (this instanceof ResultOk) {
            return handlers.Ok(this._val as T);
        }

        return handlers.Err(this._val as E);
    }

    unwrap(): T | never {
        return this.match({
            Ok: (v) => v,
            Err: (e) => panic("Unwrapped Err variant : " + (isString(e) ? e : JSON.stringify(e))),
        });
    }

}


class ResultOk<T extends Val> extends Result<T, never> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class ResultErr<E extends Val> extends Result<never, E> {
    constructor(val: E) {
        super();
        this._val = val;
    }
}

