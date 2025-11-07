import {AssertionError} from "node:assert";
import {None, Option} from "@smuzi/std";
import {assert} from "#lib/assert.js";

export type TAssertObject = {
    hasProperty<T>(obj: T, property: string | number | symbol, value?: Option): asserts property is keyof T;
    hasValue<T>(obj: Record<any, T>, value: unknown): asserts value is T;
}

export const assertObject =  {
    hasProperty(actual, property, value = None()) {
        assert.ok(Object.prototype.hasOwnProperty.call(actual, property), "Expected that object has property " + property)

        value.match({
            Some: (expected) => {
                assert.deepEqual(actual[property], expected);
            },
            None: () => {
            },
        });
    },
    hasValue(obj, value) {
        if (! Object.values(obj).includes(value)) {
            throw new AssertionError({
                    message: "Expected object has value",
                    actual: obj,
                    expected: value,
                    operator: 'Object.values(obj).includes(value)'
                }
            )
        }

    }
}