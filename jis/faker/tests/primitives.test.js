import {describe, it, assert} from "@jis/tests";

import {faker} from "../src/index.js";

describe("Faker-Primitives", () => {
    it('string', () => {
        const fakeString = faker.string();
        assert.equal(typeof fakeString, "string");

        const [min, max] = [2, 10];
        const fakeStringWithLength = faker.string(min,max);
        assert.equal(typeof fakeStringWithLength, "string");
        assert.equalTrue(fakeStringWithLength.length >= min , true);
        assert.equalTrue(fakeStringWithLength.length <= max, true);
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
        assert.equalTrue(fakeIntegerWithLength >= min);
        assert.equalTrue(fakeIntegerWithLength <= max);
    })

    it('float', () => {
        const fakeFloat = faker.float();
        assert.equal(typeof fakeFloat, "number");

        const [min, max] = [2, 100];

        const fakeFloatWithLength = faker.float(min, max);

        assert.equal(typeof fakeFloatWithLength, "number")
        assert.equalTrue(fakeFloatWithLength >= min);
        assert.equalTrue(fakeFloatWithLength <= max);
    })
})