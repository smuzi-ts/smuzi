import {assert, describe, it, repeatIt, skip, ok, err} from "@jis/tests";
// @ts-ignore
import {Ok} from "#lib/result.ts";

describe("Std-Result", () => {

    it(ok("1"), () => {
        using resultDoing = Ok("Success")

        const resultMatch = resultDoing.match({
            Ok: (v) => v,
            Err: (e) =>  e,
        });

        assert.equal(resultDoing, "Success")
    })
})