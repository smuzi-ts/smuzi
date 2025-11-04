import {AssertionError} from "node:assert";
import {isArray} from "@smuzi/std";

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