import {assert, describe, it, okMsg} from "@jis/tests";
import {MapStringPatterns, match} from "#std/match.ts";

describe("Std-match-Strings", () => {
    it(okMsg("Matched value String via String patterns"), () => {
        let handlers = new Map([
            ["A", "isA"],
            ["B", "isB"],
            ["C", "isC"],
        ]);

        let result = match("B", handlers, "isDefault")
        assert.equal(result, "isB")
    })

    it(okMsg("Not Matched value String via String patterns"), () => {
        let handlers = new Map([
            ["A", "isA"],
            ["B", "isB"],
            ["C", "isC"],
        ]);

        let result = match("Z", handlers, "isDefault")
        assert.equal(result, "isDefault")
    })

    it(okMsg("Matched value string via Functions patterns"), () => {
        let handlers = new Map([
            [(v) => v === "A", "isA"],
            [(v) => v === "B", "isB"],
            [(v) => v === "C", "isC"],
        ]);

        let result = match("B", handlers, "default")
        assert.equal(result, "isB")
    })

     it(okMsg("Not Matched value String via Functions patterns"), () => {
        let handlers = new Map([
            [(v) => v === "A", "isA"],
            [(v) => v === "B", "isB"],
            [(v) => v === "C", "isC"],
        ]);

        let result = match("Z", handlers, "default")

        assert.equal(result, "default")
    })

      it(okMsg("Matched value to Some via Callbacks"), () => {
        let handlers = new Map([
            [(v) => v === "A", (v) => v + "_isA"],
            [(v) => v === "B", (v) => v + "_isB"],
            [(v) => v === "C", (v) => v + "_isC"],
        ]);

        let result = match("B", handlers, (v) => v + "_default")

        assert.equal(result, "B_isB")
    })

        it(okMsg("Matched value to Array pattern via Combinations patterns "), () => {
            let handlers = MapStringPatterns([
                ["1", "is_1"],
                [["2","3"], "is_2_or_3"],
                [(v) => v === "4", "is_4"],
                ["5", 'is_5']
            ]);
    
            let result = match("2", handlers, "isDefault")
            assert.equal(result, "is_2_or_3")
        })
    
        it(okMsg("Matched value to Function pattern via Combinations patterns "), () => {
            let handlers = MapStringPatterns([
                ["1", "is_1"],
                [["2","3"], "is_2_or_3"],
                [(v) => v === "4", "is_4"],
                ["5", 'is_5']
            ]);
    
            let result = match("4", handlers, "isDefault")
            assert.equal(result, "is_4")
        })

    it(okMsg("Matched value to RegExp"), () => {
        let result = "users/3"
        let patterns = new Map();

        patterns.set("users", "users list");
        patterns.set("users/archived", "list of archived users");
        patterns.set(/^users\/\d+$/, "find");

        let resultMatch = match(result, patterns, "not found")

        assert.equal(resultMatch, "find")
    })
})
