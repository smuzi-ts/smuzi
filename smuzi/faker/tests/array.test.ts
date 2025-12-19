import {assert, it} from "@smuzi/tests";
import {faker} from "#lib/index.js";
import {testRunner} from "./index.js";

testRunner.describe("Faker-Array", [
    it("items() — returns an array with default length", () => {
        const arr = faker.array.items();
        assert.isArray(arr);
        assert.equal(arr.length, 5);
    }),

    it("items() — creates an array with a custom length", () => {
        const arr = faker.array.items({ length: 10 });
        assert.equal(arr.length, 10);
    }),

    it("items() — uses custom builderItem function", () => {
        const arr = faker.array.items({
            length: 3,
            builderItem: (i) => `val-${i}`,
        })

        assert.equal(arr.length, 3);
        assert.equal(arr[0], "val-0");
        assert.equal(arr[1], "val-1");
        assert.equal(arr[2], "val-2");
    }),

    it("getItem() — returns a random element from an array", () => {
        const source = ["apple", "banana", "cherry"];
        const result = faker.array.getItem(source);

        assert.array.hasValue(source, result)
    }),

    it("getItem() — works correctly with number arrays", () => {
        const source = [1, 2, 3, 4, 5];
        const result = faker.array.getItem(source);

        assert.array.hasValue(source, result)
        assert.isNumber(result);
    }),

    it("getItem() — returns empty for an empty array", () => {
        const source: string[] = [];
        const result = faker.array.getItem(source);

        assert.isEmpty(result);
    })
]);
