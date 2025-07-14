export function Ok<T>(value: T): Result<T, null> {
    return new ResultOk<T>(value);
}

export function Err<E>(error: E): Result<null, E> {
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


class ResultOk<T> extends Result<T, null> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class ResultErr<E> extends Result<null, E> {
    constructor(val: E) {
        super();
        this._val = val;
    }
}

