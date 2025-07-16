import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {match} from "#std/match.ts";
import {isString, isBool, isArray} from "#std/checker.ts";

describe("Std-match", () => {
    it(okMsg("Matched value string to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = match("test", handlers, "default")
        assert.equal(result, "isString")
    })

    it(okMsg("Matched value boolean to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = match(true, handlers, "default")
        assert.equal(result, "isBool")
    })

     it(okMsg("Not Matched value"), () => {
        let handlers = new Map([
            [isArray, "isArray"],
            [isBool, "isBool"],
        ]);

        let result = match("test", handlers, "default")
        assert.equal(result, "default")
    })
})
