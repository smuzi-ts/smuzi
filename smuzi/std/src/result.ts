import {asFunction, asString, isNull} from "./checker.js";
import {type IMatched } from "./match.js";
import { panic } from "./panic.js";
import {json} from "#lib/json.js";
import { None } from "./option.js";
import { StdError } from "./error.js";
import {dump} from "#lib/debug.js";

type Val = unknown;

export type ResultPatterns<T, E, RO, RE> = { Ok: (value: T) => RO; Err: (error: E) => RE | RO; }

export function Ok<T extends Val>(value: T): Result<T, never> {
    return new ResultOk<T>(value);
}

export function Err<E extends Val>(error: E): Result<never, E> {
    return new ResultErr<E>(error);
}

export function OkOrNullableAsError<T extends unknown, E = string>(value: T, errIfNullable?: E): Result<T, E> {
    return value === null || value === undefined ? Err((errIfNullable ?? "Nullable value") as E) : Ok(value);
}

function unwrapErrorPanic(err): never
{
    panic(err);
}

export class Result<T = unknown, E = unknown> implements IMatched {
    protected _val: T | E;

    match<RO, RE>(handlers: ResultPatterns<T, E, RO, RE>): RO | RE {
        if (this instanceof ResultOk) {
            return handlers.Ok(this._val as T);
        }

        return handlers.Err(this._val as E);
    }

    unwrapValue(): T | E {
        return this._val;
    }

    unwrap(): T | never {
        return this.match({
            Ok: (v) => v,
            Err: unwrapErrorPanic,
        });
    }

    debug(): this {
        console.trace(this);
        return this;
    }

    okOr<RE extends Result>(errHandler: ((value: E) => RE) | RE): RE | Result<T, never> {
        if (this instanceof ResultErr) {
            return asFunction(errHandler) ? errHandler(this._val) : errHandler;
        }

        return this as unknown as Result<T, never>;
    }

    errOr<RO extends Result>(okHandler: ((value: T) => RO) | RO): RO | Result<never, E> {
        if (this instanceof ResultOk) {
            return asFunction(okHandler) ? okHandler(this._val) : okHandler;
        }

        return this as unknown as Result<never, E>;
    }

    okThen<R = unknown>(handler: (value: T) => void): void {
        if (this instanceof ResultOk) {
            handler(this._val);
        }
    }


    errThen<R = unknown>(handler: (value: E) => void): void {
        if (this instanceof ResultErr) {
            handler(this._val);
        }
    }

    mapOk<RO>(handler: (value: T) => RO): Result<RO, E> {
        if (this instanceof ResultOk) {
            return Ok(handler(this._val));
        }

        return this as unknown as Result<never, E>;
    }

    mapErr<RE>(handler: (value: E) => RE): Result<T, RE> {
        if (this instanceof ResultErr) {
            return Err(handler(this._val));
        }

        return this as unknown as Result<T, never>;
    }

    isErr(): this is ResultErr<E> {
        return this instanceof ResultErr
    }

    toOption() {
        if (this instanceof ResultErr) {
            return None();
        }

        return this as unknown as Result<T, never>;
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


export function isResult(value: unknown): value is Result<unknown, unknown> {
    return value instanceof Result;
}
