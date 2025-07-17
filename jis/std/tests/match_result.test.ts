import {assert, describe, errMsg, it, okMsg} from "@jis/tests";
import {Err, Ok, Result} from "#std/result.ts";
import { match } from "#std/match.ts";

describe("Std-Result", () => {
    it(okMsg("Matched Ok"), () => {
        let resultDoing = generateResult(true)

        const resultMatch = match(
            resultDoing,
        {
            Ok: (v) => v,
            Err: (e) =>  e,
        });

        assert.equal(resultMatch, "Success")
    })

      it(errMsg("Matched Err"), () => {
        let resultDoing = generateResult(false)

        const resultMatch = resultDoing.match({
            Ok: (v) => "some",
            Err: (e) =>  e,
        });

        assert.equal(resultMatch, 500)
    })
})


function generateResult(flag: boolean): Result<string, number> {
    return flag ? Ok("Success") : Err(500)
}
