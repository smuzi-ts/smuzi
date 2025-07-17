import {assert, describe, it, okMsg} from "@jis/tests";
import {match} from "#std/match.ts";
import {isString, isBool, isArray} from "#std/checker.ts";

describe("Std-match", () => {
    it(okMsg("Matched value to string patterns"), () => {
        let handlers = new Map([
            ["a", "isA"],
            ["b", "isB"],
            ["c", "isC"],
        ]);

        let result = match({val:"b", handlers, deflt: "isDefault"})
        assert.equal(result, "isB")
    })

    it(okMsg("Matched value string to Some"), () => {
        let handlers = new Map([
            [isString, "isString"],
            [isBool, "isBool"],
        ]);

        let result = match({val:"test", handlers, deflt: "default"})
        assert.equal(result, "isString")
    })

     it(okMsg("Not Matched value"), () => {
        let handlers = new Map([
            [isArray, "isArray"],
            [isBool, "isBool"],
        ]);

        let result = match({val:"test", handlers, deflt: "default"})

        assert.equal(result, "default")
    })

      it(okMsg("Matched value to Some via Callbacks"), () => {
        let handlers = new Map([
            [isString, (v) => v + "_isString"],
            [isBool, (v) => v + "_isBool"],
        ]);

        let result = match({val: 1, handlers, deflt: (v) => v + "_default"})

        assert.equal(result, "1_default")
    })
})
