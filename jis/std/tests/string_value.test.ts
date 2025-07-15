import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {StringValue} from "#std/string_value.ts";

import {isString, isBool, isArray} from "#std/checker.ts";
import { None } from "#std/option.ts";

describe("Std-StringValue", () => {
    it(okMsg("Custom handlers, matched value string to Some"), () => {
        let router = new Map([
            ["GET", () => "find"],
            ["POST", () => "save"],
        ]);

        let method = "GET";
        let handler =  StringValue(method);
        let response = handler.match(router, (v) => "Undefined");

        assert.equal(response, "find")
    })

})
