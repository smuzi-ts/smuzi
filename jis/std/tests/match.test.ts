import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {match} from "#std/match.ts";
import {isString, isBool, isArray} from "#std/checker.ts";

describe("Std-matchExp", () => {
    it(okMsg("Custom handlers, matched value string to Some"), () => {
        let handlers = new Map([
            [m => m === "GET", "find"],
            [m => m === "POST", "save"],
        ]);

        let result = match(1, handlers)
        assert.equalSome(result, "isString")
    })


    it(okMsg("Matched value string to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = match("test", handlers)
        assert.equalSome(result, "isString")
    })

    it(okMsg("Matched value boolean to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = match(true, handlers)
        assert.equalSome(result, "isBool")
    })

     it(okMsg("Matched value string to None"), () => {
        let handlers = new Map([
            [isArray, "isArray"],
            [isBool, "isBool"],
        ]);

        let result = match("test", handlers)
        assert.equalNone(result)
    })
})
