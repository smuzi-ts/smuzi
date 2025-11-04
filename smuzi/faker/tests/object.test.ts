import {assert, describe, it} from "@smuzi/tests";
import {faker} from "#lib/index.ts";

describe("Faker-Object", () => {
    it("getProperty() — returns a random key from the object", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const prop = faker.object.getProperty(obj);

        assert.isString(prop);
        assert.objectHasProperty(obj, prop);
    });

    it("getProperty() — returns empty when object has no keys", () => {
        const obj: Record<string, unknown> = {};
        const prop = faker.object.getProperty(obj);

        assert.isEmpty(prop);
    });

    it("getPropertyValue() — returns a value corresponding to a random key", () => {
        const obj = { a: 10, b: 20, c: 30 };
        const value = faker.object.getPropertyValue(obj);

        assert.isNumber(value);
        assert.objectHasValue(obj, value);
    });

    it("getPropertyValue() — works correctly with string values", () => {
        const obj = { name: "John", city: "Kyiv", role: "Admin" };
        const value = faker.object.getPropertyValue(obj);

        assert.isString(value);
        assert.objectHasValue(obj, value);
    });

    it("getPropertyValue() — returns empty for empty object", () => {
        const obj: Record<string, number> = {};
        const value = faker.object.getPropertyValue(obj);

        assert.isEmpty(value);
    });
});
