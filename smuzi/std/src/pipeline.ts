export class Pipe<R = unknown>{
    _result: R;

    private constructor(result: R) {
        this._result = result;
    }

    static do<RFN = unknown>(fn: () => RFN) {
        return new Pipe<RFN>(fn());
    }

    static with<T = unknown>(val: T) {
        return new Pipe<T>(val);
    }

    do<RFN = unknown>(fn:((arg: R) => RFN)) {
    
        return new Pipe<RFN>(fn(this._result));
    }

    doArgs<RFN = unknown>(fn: (...args: any[]) => RFN): Pipe<RFN> {
        const result = Array.isArray(this._result)
            ? fn(...this._result)
            : fn(this._result);

        return new Pipe<RFN>(result);
    }
    get(): R
    {
        return this._result;
    }
}