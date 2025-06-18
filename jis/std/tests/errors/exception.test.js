
import {assert, describe, it} from "@jis/tests";
import {Exception} from "#lib/prelude.js";

describe("Errors-Exception", () => {

    it("", () => {
        try {
            throw new Exception('test');
        } catch (exception) {
            if (exception instanceof Exception) {
                console.log(exception.line);
            }
        }
    })

})