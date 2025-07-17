import {assert, describe, it, skip, okMsg} from "@jis/tests";
import {MapNumberPatterns, match} from "#std/match.ts";

describe("Std-match-Numbers", () => {
    it(okMsg("Matched value via Number patterns"), () => {
        let handlers = new Map([
            [1, "isOne"],
            [2, "isTwo"],
            [3, "isThree"],
        ]);

        let result = match({val: 2, handlers, deflt: "isDefault"})
        assert.equal(result, "isTwo")
    })

    it(okMsg("Not Matched value via Number patterns"), () => {
        let handlers = new Map([
            [1, "isOne"],
            [2, "isTwo"],
            [3, "isThree"],
        ]);

        let result = match({val:4, handlers, deflt: "isDefault"})
        assert.equal(result, "isDefault")
    })

    it(okMsg("Matched value via Functions patterns"), () => {
        let handlers = new Map([
            [(v) => v === 1, "isOne"],
            [(v) => v === 2, "isTwo"],
            [(v) => v === 3, "isThree"],
        ]);

        let result = match({val: 2, handlers, deflt: "isDefault"})
        assert.equal(result, "isTwo")
    })

     it(okMsg("Not Matched value via Functions patterns"), () => {
        let handlers = new Map([
            [(v) => v === 1, "isOne"],
            [(v) => v === 2, "isTwo"],
            [(v) => v === 3, "isThree"],
        ]);

        let result = match({val: 4, handlers, deflt: "isDefault"})

        assert.equal(result, "isDefault")
    })

      it(okMsg("Matched value via Number, return using Callbacks"), () => {
        let handlers = new Map([
            [1, (v) => v + 10],
            [2, (v) => v + 20],
            [3, (v) => v + 30],
        ]);

        let result = match({val: 2, handlers, deflt: (v) => v + 40})

        assert.equal(result, 22)
    })

    it(okMsg("Matched value via  Array of Numbers  patterns"), () => {
        let handlers = new Map([
            [[1], "is_1"],
            [[2,3], "is_2_or_3"],
            [[4,5], "is_4_or_5"],
        ]);

        let result = match({val: 3, handlers, deflt: "isDefault"})
        assert.equal(result, "is_2_or_3")
    })


    it(okMsg("Matched value to Array pattern via Combinations patterns "), () => {
        let handlers = MapNumberPatterns([
            [1, "is_1"],
            [[2,3], "is_2_or_3"],
            [(v) => v === 4, "is_4"],
            [5, 'is_5']
        ]);

        let result = match({val: 2, handlers, deflt: "isDefault"})
        assert.equal(result, "is_2_or_3")
    })

    it(okMsg("Matched value to Function pattern via Combinations patterns "), () => {
        let handlers = MapNumberPatterns([
            [1, "is_1"],
            [[2,3], "is_2_or_3"],
            [(v) => v === 4, "is_4"],
            [5, 'is_5']
        ]);

        let result = match({val: 4, handlers, deflt: "isDefault"})
        assert.equal(result, "is_4")
    })
})
