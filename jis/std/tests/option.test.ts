import {assert, describe, it, okMsg} from "@jis/tests";
import {Some, None} from "#std/option.ts";

describe("Std-Option", () => {

    it(okMsg("Matched - Some"), () => {
        let resultDoing = Some("Success")


        const resultMatch = resultDoing.match({
            Some: (v) => v,
            None: () =>  "None",
        });

        assert.equal(resultMatch, "Success!!!")
    })

     it(okMsg("Matched - None"), () => {
        let resultDoing = None()

        const resultMatch = resultDoing.match({
            Some: (v) => v,
            None: () =>  "None",
        });

        assert.equal(resultMatch, "None")
    })
})

export function isOption(value: unknown): boolean {
    return value instanceof Option;
}