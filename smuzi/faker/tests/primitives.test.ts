import {assert, it} from "@smuzi/tests";
import {faker} from "#lib/index.js";
import {testRunner} from "./index.js";

testRunner.describe("Faker-Primitives", [
    it('string', () => {
        const fakeString = faker.string();
        assert.isString(fakeString);

        const [min, max] = [2, 10];
        const fakeStringWithLength = faker.string({min, max});
        assert.isString(fakeStringWithLength);
        assert.isTrue(fakeStringWithLength.length >= min);
        assert.isTrue(fakeStringWithLength.length <= max);
    }),

    it('boolean', () => {
        const fakeBoolean = faker.boolean();
        assert.isBoolean(fakeBoolean);
    }),

    it('integer', () => {
        const fakeInteger = faker.integer();
        assert.isNumber(fakeInteger);

        const [min, max] = [2, 100];

        const fakeIntegerWithLength = faker.integer(min, max);

        assert.isNumber(fakeIntegerWithLength)
        assert.isTrue(fakeIntegerWithLength >= min);
        assert.isTrue(fakeIntegerWithLength <= max);
    }),

    it('float', () => {
        const fakeFloat = faker.float();
        assert.isNumber(fakeFloat);

        const [min, max] = [2, 100];

        const fakeFloatWithLength = faker.float(min, max);

        assert.isNumber(fakeFloatWithLength)
        assert.isTrue(fakeFloatWithLength >= min);
        assert.isTrue(fakeFloatWithLength <= max);
    })
])