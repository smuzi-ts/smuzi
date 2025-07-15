import {assert, describe, errMsg, it, skip, okMsg} from "@jis/tests";
import {StringValue, MapStringPatterns} from "#std/string_value.ts";
import { echo } from "#std/debug.ts";


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

      it(okMsg("Not Matched to any values"), () => {
        let routes = getRoutes();
        let method = "DELETE";
        let handler =  StringValue(method);
        let response = handler.match(routes, (v) => 1);
        echo(response)
        assert.equal(response, "Undefined")
    })

})
