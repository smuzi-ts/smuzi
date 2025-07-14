// import {Struct} from "#lib/spec/struct.js";
// import {Schema} from "#lib/spec/schema.js";
//

type User = {
    name: string,
    age: number,
}

function calc() {

}

class Result<T, E> {
    #_type: string;
    #val: T | E;

    constructor(type: string, val: T | E) {
        this.#val = val;
    }

    static Ok<T>(value: T): Result<T, null> {
        return new Result<T, null>("Ok", value);
    }

    static Err<E>(error: E): Result<null, E> {
        return new Result<null, E>("Err", error);
    }

    match(handlers: { Ok: (value: T) => unknown; Err: (error: E) => unknown;  }): unknown {
        if (this.#_type == 'Ok') {
            return handlers.Ok(this.#val as T);
        } else {
            return handlers.Err(this.#val as E);
        }
    }


    [Symbol.dispose]() {
        this.#val = null
    }
}


function test(flag): Result<string, string>   {
    return flag ? Result.Ok("String") : Result.Err("Stage");
}

function getNumber(i: number): number {
    return i+2;
}

function getString(s: string): number {
    return 2+2;
}

function main() {
    let user: User = {
        name: "Den",
        age: 18,
    }

    using res = test(1);

    const result1 = res.match({
        Ok: (v) => getString(v),
        Err: (e) =>  getNumber(1),
    });
    console.log(result1)
}

main();