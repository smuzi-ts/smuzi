import {asString} from "./checker.js";
import {type IMatched } from "./match.js";
import { panic } from "./panic.js";

type Val = NonNullable<unknown>;
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

export class Result<T, E> implements IMatched {
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
            Err: (e) => panic(asString(e) ? e : JSON.stringify(e)),
        });
    }

    wrapOk<RO>(handlerOk: (value: T) => RO): Result<RO | never, E> {
        if (this instanceof ResultOk) {
            return Ok(handlerOk(this._val))
        }

        return this as unknown as Result<never, E>;
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

