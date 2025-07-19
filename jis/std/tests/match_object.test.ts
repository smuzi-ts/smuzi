import { assert, describe, it, okMsg } from "@jis/tests";
import { match } from "#std/match.ts";

describe("Std-match-Object", () => {
    it(okMsg("Matched all properties"), () => {
        const user = { name: "F", age: 18 }
        const patterns = new Map();
        patterns.set({ name: "A", age: 18 }, 1);
        patterns.set({ name: "F", age: 20 }, 2);
        patterns.set({ name: "F", age: 18 }, 3); //<-- Matched


        const resultMatch = match(user, patterns, 4)

        assert.equal(resultMatch, 3)
    })

    it(okMsg("Matched all properties , using also RegExp"), () => {
        const user = { name: "Richard Man", age: 18 }
        const patterns = new Map();
        patterns.set({ name: "Richard One", age: 18 }, 10);
        patterns.set({ name: /^Richard\s+\w+$/, age: 20 }, 20);
        patterns.set({ name: /^Richard\s+\w+$/, age: 18 }, 30); //<-- Matched


        const resultMatch = match(user, patterns, 40)

        assert.equal(resultMatch, 30)
    })


    it(okMsg("Matched some properties , using also RegExp"), () => {
        const patterns = new Map();
        patterns.set({ name: "Richard One" }, "Richard One"); //<-- user1
        patterns.set({ name: /^Richard\s+\w+$/, age: 18 }, "Richard with any Last Name and age = 18"); //<-- user2
        patterns.set({ name: /^Richard\s+\w+$/, age: 25 }, "Richard with any Last Name and age = 25"); //<-- user3
        patterns.set({ name: /^Richard\s+\w+$/ }, "Richard with any Last Name and age != 18 and != 25"); //<-- user4

        const user1 = { name: "Richard One", age: 25 }
        const resultMatch1 = match(user1, patterns, "Undefined man")

        assert.equal(resultMatch1, "Richard One")

        const user2 = { name: "Richard User2", age: 18 }
        const resultMatch2 = match(user2, patterns, "Undefined man")

        assert.equal(resultMatch2, "Richard with any Last Name and age = 18")

        const user3 = { name: "Richard User3", age: 25 }
        const resultMatch3 = match(user3, patterns, "Undefined man")

        assert.equal(resultMatch3, "Richard with any Last Name and age = 25")

        const user4 = { name: "Richard User4", age: 60 }
        const resultMatch4 = match(user4, patterns, "Undefined man")

        assert.equal(resultMatch4, "Richard with any Last Name and age != 18 and != 25")
    })
})