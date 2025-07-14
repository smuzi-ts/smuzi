export function Some<T>(value: T): Option<T> {
    return new OptionSome<T>(value);
}

export function None(): Option<never> {
    return new OptionNone();
}

export class Option<T> {
    protected _val: T;
    
    match(handlers: { Some: (value: T) => unknown; None: () => unknown; }): unknown {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }
}


class OptionSome<T> extends Option<T> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class OptionNone  extends Option<never>{
    constructor() {
        super();
    }
}
