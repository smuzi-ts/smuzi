import {assert, errMsg, it, okMsg} from "@smuzi/tests";
import {Err, Ok, Result} from "#lib/result.js";
import {testRunner} from "../index.js";

testRunner.describe("Std-Result", [
    it(okMsg("Matched Ok"), () => {
        let resultDoing = generateResult(true)

        const resultMatch = resultDoing.match(
        {
            Ok: (v) => v,
            Err: (e) =>  e,
        });

        assert.equal(resultMatch, "Success")
    }),

    it(errMsg("Matched Err"), () => {
        let resultDoing = generateResult(false)

        const resultMatch = resultDoing.match({
            Ok: (v) => "some",
            Err: (e) =>  e,
        });

        assert.equal(resultMatch, 500)
    })
])


function generateResult(flag: boolean): Result<string, number> {
    return flag ? Ok("Success") : Err(500)
}
