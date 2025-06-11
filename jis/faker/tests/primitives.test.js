import {describe, it} from "node:test";
import assert from "node:assert";

import {faker} from "../src/index.js";

describe("Faker-Primitives", () => {
    it('string', () => {
        const fakeString = faker.string();
        assert.equal(typeof fakeString, "string");

        const [min, max] = [2, 10];
        const fakeStringWithLength = faker.string(min,max);
        assert.equal(typeof fakeStringWithLength, "string");
        assert.equal(fakeStringWithLength.length >= min , true);
        assert.equal(fakeStringWithLength.length <= max, true);
    })

    it('boolean', () => {
        const fakeBoolean = faker.boolean();
        assert.equal(typeof fakeBoolean, "boolean");
    })

    it('integer', () => {
        const fakeInteger = faker.integer();
        assert.equal(typeof fakeInteger, "number");

        const [min, max] = [2, 100];

        const fakeIntegerWithLength = faker.integer(min, max);

        assert.equal(typeof fakeIntegerWithLength, "number")
        assert.equal(fakeIntegerWithLength >= min , true);
        assert.equal(fakeIntegerWithLength <= max, true);
    })

    it('float', () => {
        const fakeFloat = faker.float();
        assert.equal(typeof fakeFloat, "number");

        const [min, max] = [2, 100];

        const fakeFloatWithLength = faker.float(min, max);

        assert.equal(typeof fakeFloatWithLength, "number")
        assert.equal(fakeFloatWithLength >= min , true);
        assert.equal(fakeFloatWithLength <= max, true);
    })
})