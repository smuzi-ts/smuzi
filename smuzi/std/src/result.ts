import {asFunction, asString, isNull} from "./checker.js";
import {type IMatched } from "./match.js";
import { panic } from "./panic.js";
import {json} from "#lib/json.js";
import { None } from "./option.js";

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

function unwrapErrorPanic(e): never
{
    panic(asString(e) ? e : json.toString(e).match({
        Ok: (v) => v,
        Err: (e) => e.message
    }));
}

export class Result<T = unknown, E = unknown> implements IMatched {
    protected _val: T | E;

    match<RO, RE>(handlers: ResultPatterns<T, E, RO, RE>): RO | RE {
        if (this instanceof ResultOk) {
            return handlers.Ok(this._val as T);
        }

        return handlers.Err(this._val as E);
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

    errOr<RE = unknown>(ok: ((value: E) => RE) | RE): T | RE {
        if (this instanceof ResultErr) {
            return asFunction(ok) ? ok(this._val) : ok;
        }

        return this._val as T;
    }

    okOr<RO = unknown>(err: ((value: E) => RO) | RO): E | RO {
        if (this instanceof ResultOk) {
            return asFunction(err) ? err(this._val) : err;
        }

        return this._val as E;
    }

    okThen<R = unknown>(handler: (value: T) => R): E | R {
        if (this instanceof ResultOk) {
            return handler(this._val);
        }

        return this._val as E;
    }


    errThen<R = unknown>(handler: (value: E) => R): T | R {
        if (this instanceof ResultErr) {
            return handler(this._val);
        }

        return this._val as T;
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
