import {assert, describe, it, okMsg} from "@jis/tests";
import { matchVariant } from "#std/match.ts";

export type CustomOptionPatterns<T = unknown, R = unknown> = { CustomSome: (value: T) => R; CustomNone: () => R; }

export class CustomOption<T> {
    protected _val: T;
    
    match<R>(handlers: CustomOptionPatterns<T,R>): R {
        if (this instanceof CustomOptionSome) {
            return handlers.CustomSome(this._val as T);
        }

        return handlers.CustomNone();
    }
}


class CustomOptionSome<T> extends CustomOption<T> {
    constructor(val: T) {
        super();
        this._val = val;
    }
}

class CustomOptionNone extends CustomOption<never>{
    constructor() {
        super();
    }
}

describe("Std-match-Custom Variants", () => {
    it(okMsg("Matched to Custom Some"), () => {
        let resultDoing = new CustomOptionSome("Success")

        const resultMatch = matchVariant<CustomOptionPatterns>(
            resultDoing,
            {
                CustomSome: (v) => v + "!!!",
                CustomNone: () =>  "None",
            },
             false);

        assert.equal(resultMatch, "Success!!!")
    })

    it(okMsg("Matched to Custom None"), () => {
        let resultDoing = new CustomOptionNone()


        const resultMatch = matchVariant<CustomOptionPatterns>(
            resultDoing,
            {
                CustomSome: (v) => v + "!!!",
                CustomNone: () =>  "None",
            },
             false);

        assert.equal(resultMatch, "None")
    })
})