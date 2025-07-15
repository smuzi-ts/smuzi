import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {StringValue, MapStringPatterns} from "#std/string_value.ts";

import {isString, isBool, isArray} from "#std/checker.ts";
import { None } from "#std/option.ts";


function getRoutes() {
    return MapStringPatterns([
            ["GET", () => "find"],
            ["POST", () => "save"],
            [["PUT", "PATCH"], () => "update"],
        ]);
}

describe("Std-StringValue", () => {

    it(okMsg("Matched to string"), () => {
        let routes = getRoutes();
        let method = "GET";
        let handler =  StringValue(method);
        let response = handler.match(routes, (v) => "Undefined");

        assert.equal(response, "find")
    }),

     it(okMsg("Matched to array of strings"), () => {
        let routes = getRoutes();
        let method = "PATCH";
        let handler =  StringValue(method);
        let response = handler.match(routes, (v) => "Undefined");

        assert.equal(response, "update")
    })

})
