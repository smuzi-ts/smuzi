export class String<T> {
    protected _val: T
    
    match(handlers: { Some: (value: T) => unknown; None: () => unknown; }): unknown {
        if (this instanceof OptionSome) {
            return handlers.Some(this._val as T);
        }

        return handlers.None();
    }
}
