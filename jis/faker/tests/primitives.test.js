import {assert, describe, it} from "@jis/tests";
import {faker} from "#lib/index.js";

describe("Faker-Primitives", () => {
    it('string', () => {
        const fakeString = faker.string();
        assert.isString(fakeString);

        const [min, max] = [2, 10];
        const fakeStringWithLength = faker.string(min,max);
        assert.isString(fakeStringWithLength);
        assert.isTrue(fakeStringWithLength.length >= min);
        assert.isTrue(fakeStringWithLength.length <= max);
    })

    it('boolean', () => {
        const fakeBoolean = faker.boolean();
        assert.isBoolean(fakeBoolean);
    })

    it('integer', () => {
        const fakeInteger = faker.integer();
        assert.isInteger(fakeInteger);

        const [min, max] = [2, 100];

        const fakeIntegerWithLength = faker.integer(min, max);

        assert.isInteger(fakeIntegerWithLength)
        assert.isTrue(fakeIntegerWithLength >= min);
        assert.isTrue(fakeIntegerWithLength <= max);
    })

    it('float', () => {
        const fakeFloat = faker.float();
        assert.isFloat(fakeFloat);

        const [min, max] = [2, 100];

        const fakeFloatWithLength = faker.float(min, max);

        assert.isFloat(fakeFloatWithLength)
        assert.isTrue(fakeFloatWithLength >= min);
        assert.isTrue(fakeFloatWithLength <= max);
    })
})