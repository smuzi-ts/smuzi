import {assert, describe, it, okMsg} from "@jis/tests";
import {Some, None} from "#std/option.ts";
import { match } from "#std/match.ts";

describe("Std-match-Option", () => {
    it(okMsg("Matched to Some"), () => {
        let resultDoing = Some("Success")


        const resultMatch = match(
            resultDoing,
            {
                Some: (v) => v + "!!!",
                None: () =>  "None",
    
        });

        assert.equal(resultMatch, "Success!!!")
    })

     it(okMsg("Matched to None"), () => {
        let resultDoing = None()

        const resultMatch = match(resultDoing, {
            Some: (v) => v,
            None: () =>  "None",
        });

        assert.equal(resultMatch, "None")
    })
})