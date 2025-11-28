import { assert, describe, it, okMsg } from "@smuzi/tests";
import { Some, None } from "#lib/option.js";

export default describe("Std-match-Option", [
    it(okMsg("Matched to Some"), () => {
        let resultDoing = Some("Success")

        let resultMatch = resultDoing.match({
            Some: (v) => v + "!!!",
            None: () => "None!!!"
        })

        assert.equal(resultMatch, "Success!!!")
    }),

    it(okMsg("Matched to None"), () => {
        let resultDoing = None()

        const resultMatch = resultDoing.match({
            Some: (v) => v,
            None: () => "None",
        });

        assert.equal(resultMatch, "None")
    })
])