import {describe, it} from "node:test";
import assert from "node:assert";
import {faker} from "../src/index.js";

describe("Faker-Primitives", () => {
    it('string', () => {
        const fakeString = faker.string();
        assert.equal(typeof fakeString, "string");

        const fakeStringWithLength = faker.string(100);
        assert.equal(typeof fakeStringWithLength, "string");
    })

    it('boolean', () => {
        const fakeBoolean = faker.boolean();
        assert.equal(typeof fakeBoolean, "boolean");
    })

    it('integer', () => {
        const fakeInteger = faker.integer();
        assert.equal(typeof fakeInteger, "number");
        const fakeIntegerWithLength = faker.integer(2);

        assert.equal(typeof fakeIntegerWithLength, "number")
    })
})