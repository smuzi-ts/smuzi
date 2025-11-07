import {AssertionError} from "node:assert";
import {isArray} from "@smuzi/std";

export type TAssertArray = {
    hasValue<T>(array: T[], value: T): asserts value is T
}

export const assertArray: TAssertArray = {
    hasValue(array, value) {
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