import {AssertionError} from "node:assert";
import {asString, isArray} from "@smuzi/std";

export type TAssertString = {
    contains(actual: unknown, substring: string): asserts substring is string
}

export const assertString: TAssertString = {
    contains(actual, substring) {
        if (! asString(actual) || !actual.includes(substring)) {
            throw new AssertionError({
                    message: "Expected string contains substring",
                    actual: actual,
                    expected: substring,
                    operator: 'actual.includes(substring)'
                }
            )
        }
    }
}