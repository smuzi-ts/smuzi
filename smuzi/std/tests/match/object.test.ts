import { assert, it, okMsg } from "@smuzi/tests";
import { match } from "#lib/match.js";
import {testRunner} from "../index.js";

testRunner.describe("Std-match-Object", [
    it(okMsg("Matched all properties"), () => {
        const user = { name: "F", age: 18 }
        const patterns = new Map();
        patterns.set({ name: "A", age: 18 }, 1);
        patterns.set({ name: "F", age: 20 }, 2);
        patterns.set({ name: "F", age: 18 }, 3); //<-- Matched


        const resultMatch = match(user, patterns, 4)

        assert.equal(resultMatch, 3)
    }),

    it(okMsg("Matched all properties , using also RegExp"), () => {
        const user = { name: "Richard Man", age: 18 }
        const patterns = new Map();
        patterns.set({ name: "Richard One", age: 18 }, 10);
        patterns.set({ name: /^Richard\s+\w+$/, age: 20 }, 20);
        patterns.set({ name: /^Richard\s+\w+$/, age: 18 }, 30); //<-- Matched


        const resultMatch = match(user, patterns, 40)

        assert.equal(resultMatch, 30)
    }),


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
    }),

    it(okMsg("Matched all properties , using also array of options"), () => {
        const patterns = new Map();
        patterns.set({ name: "Richard", age: 5 }, "baby"); //<-- user 1
        patterns.set({ name: "Richard", age: 20 }, "young");// <-- user2 
        patterns.set({ name: "Richard", age: [50, 60]}, "old"); //<-- user3 or user4

        // Variant 1
        const user1 = { name: "Richard", age: 5 }
        const resultMatch1 = match(user1, patterns, "undefined")
        assert.equal(resultMatch1, "baby")

        // Variant 2
        const user2 = { name: "Richard", age: 20 }
        const resultMatch2 = match(user2, patterns, "undefined")
        assert.equal(resultMatch2, "young")

        // Variant 3
        const user3 = { name: "Richard", age: 50 }
        const resultMatch3 = match(user3, patterns, "undefined")
        assert.equal(resultMatch3, "old")

        // Variant 3
        const user4 = { name: "Richard", age: 60 }
        const resultMatch4 = match(user4, patterns, "undefined")
        assert.equal(resultMatch3, "old")
    }),

      it(okMsg("Matched via function checker"), () => {
        const patterns = new Map([
            [{age: (a) => a <= 5 }, "baby"], //<-- user 1
            [{age: (a) => a <= 20 }, "young"], // <-- user2 
            [{age: (a) => a <= 60 }, "man"], //<-- user3
        ]);
    
        // Variant 1
        const user1 = { name: "Baby", age: 5 }
        const resultMatch1 = match(user1, patterns, "old")
        assert.equal(resultMatch1, "baby")

        // Variant 2
        const user2 = { name: "Young", age: 20 }
        const resultMatch2 = match(user2, patterns, "old")
        assert.equal(resultMatch2, "young")

        // Variant 3
        const user3 = { name: "Man", age: 40 }
        const resultMatch3 = match(user3, patterns, "old")
        assert.equal(resultMatch3, "man")

        // Variant 4
        const user4 = { name: "Old", age: 65 }
        const resultMatch4 = match(user4, patterns, "old")
        assert.equal(resultMatch4, "old")
    })
])