import { assert, describe, it, okMsg } from "@smuzi/tests";
import { match } from "#std/match.ts";

describe("Std-match-Array", () => {
    it(okMsg("Matched all values is Strings"), () => {
        let result = ["F", "G", "H"]
        let patterns = new Map();
        patterns.set(["A", "B", "C"], 1);
        patterns.set(["F", "G", "H"], 2);
        patterns.set(["X", "Y", "Z"], 3);

        let resultMatch = match(result, patterns, 4)

        assert.equal(resultMatch, 2)
    })

    it(okMsg("Matched all values is Numbers"), () => {
        let result = [1, 3, 5]
        let patterns = new Map();

        patterns.set([1, 3, 16], 10);
        patterns.set([1, 14, 5], 20);
        patterns.set([1, 3, 5], 30);
        patterns.set([1, 14, 15], 40);

        let resultMatch = match(result, patterns, 50)

        assert.equal(resultMatch, 30)
    })


    it(okMsg("Matched values is combinations of Strings and Numbers"), () => {
        let result = ["F", 3, "H"]
        let patterns = new Map();

        patterns.set(["A", "B", "C"], 10);
        patterns.set(["F", 3, 3], 20);
        patterns.set(["F", 3, "X"], 30);
        patterns.set(["F", 3, "H"], 40);
        patterns.set(["X", "Y", "Z"], 50);

        let resultMatch = match(result, patterns, 60)

        assert.equal(resultMatch, 40)
    })

    it(okMsg("Matched values using RegExp"), () => {
      let result = ["GET", "users/3"]
        let patterns = new Map();

        patterns.set(["GET", "users"], "users list");
        patterns.set(["POST", "users"], "create user");
        patterns.set(["GET", "users/archived"], "list of archived users");
        patterns.set(["PUT", /^users\/\d+$/], "update user");
        patterns.set(["GET", /^users\/\d+$/], "find user");

        let resultMatch = match(result, patterns, "not found")

        assert.equal(resultMatch, "find user")
    })
})