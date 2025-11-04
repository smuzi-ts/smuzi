import {AssertionError} from "node:assert";
import {isArray, isObject, None} from "@smuzi/std";
import {assert} from "#lib/assert.ts";

export default {
    isArray(actual) {
        if (!isArray(actual)) {
            throw new AssertionError({
                    message: "Expected array, but get other",
                    actual,
                    expected: "array",
                    operator: 'isArray'
                }
            )
        }
    },
    arrayHasValue(array: unknown[], value: unknown) {
        this.isArray(array)

        if (!array.includes(value)) {
            throw new AssertionError({
                    message: "Expected array has value",
                    actual: array,
                    expected: value,
                    operator: 'array.includes(value)'
                }
            )
        }
    }
}