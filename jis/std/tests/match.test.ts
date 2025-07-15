import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {matchExp} from "#std/match.ts";
import {isString, isBool, isArray} from "#std/checker.ts";

describe("Std-matchExp", () => {
    it(okMsg("Matched value string to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = matchExp("test", handlers)
        assert.equalSome(result, "isString")
    })

    it(okMsg("Matched value boolean to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = matchExp(true, handlers)
        assert.equalSome(result, "isBool")
    })

     it(okMsg("Matched value string to None"), () => {
        let handlers = new Map([
            [isArray, "isArray"],
            [isBool, "isBool"],
        ]);

        let result = matchExp("test", handlers)
        assert.equalNone(result)
    })
})
