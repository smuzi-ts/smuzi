export function Ok<T>(value: T): Result<T, never> {
    return new ResultOk<T>(value);
}

export function Err<E>(error: E): Result<never, E> {
    return new ResultErr<E>(error);
}

export class Result<T, E> {
    protected _val: T | E;
    
    match(handlers: { Ok: (value: T) => unknown; Err: (error: E) => unknown;  }): unknown {
        if (this instanceof ResultOk) {
            return handlers.Ok(this._val as T);
        }

        return handlers.Err(this._val as E);
    }

    unwrap()
    {
        return this._val;
    }

}


class ResultOk<T> extends Result<T, never> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class ResultErr<E> extends Result<never, E> {
    constructor(val: E) {
        super();
        this._val = val;
    }
}

