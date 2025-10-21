import {assert, describe, it, okMsg} from "@smuzi/tests";
import {MapStringPatterns, match} from "#lib/match.ts";
import { dump } from "#lib/debug.ts";

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
            [(v) => v === "A", (res) => res.val + "_isA"],
            [(v) => v === "B", (res) => res.val + "_isB"],
            [(v) => v === "C", (res) => res.val + "_isC"],
        ]);

        let result = match("B", handlers, (res) => "_default")

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


    it(okMsg("Matched value to RegExp and using params as array"), () => {
        let patterns = new Map();

        patterns.set("users", "users list");
        patterns.set("users/archived", "list of archived users");
        patterns.set(/^users\/(\d+)\/books\/(\d+)$/, (res) => {
            const params = res.params.unwrap();
            return "user id=" + params[0] + " | books id=" + params[1];
        })
        let result = "users/3/books/5"
        let resultMatch = match(result, patterns, "not found")

        assert.equal(resultMatch, "user id=3 | books id=5")
    })

    it(okMsg("Matched value to RegExp and using params as object"), () => {
        let patterns = new Map();

        patterns.set("users", "users list");
        patterns.set("users/archived", "list of archived users");
        patterns.set(/^users\/(?<user_id>\d+)\/books\/(?<book_id>\d+)$/, (res) => {
            const params = res.params.unwrap();
            return "user id=" + params.user_id + " | books id=" + params.book_id;
        })
        let result = "users/3/books/5"
        let resultMatch = match(result, patterns, "not found")

        assert.equal(resultMatch, "user id=3 | books id=5")
    })
})
