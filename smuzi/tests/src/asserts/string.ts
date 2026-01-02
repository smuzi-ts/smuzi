import {AssertionError} from "node:assert";
import {asString, isArray} from "@smuzi/std";

export type TAssertString = {
    contains(actual: unknown, substring: string): asserts actual is string
    containsOnce(actual: unknown, substring: string): asserts actual is string
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
    },
    containsOnce(actual, substring) {
        if (! asString(actual)) {
            throw new AssertionError({
                message: "Expected string contains substring exactly once",
                actual: actual,
                expected: substring,
                operator: 'actual.split(substring).length === 2'
            });
        }

        const occurrences = actual.split(substring).length - 1;

        if (! asString(actual) || occurrences !== 1) {
            throw new AssertionError({
                message: "Expected string contains substring exactly once",
                actual: actual,
                expected: `substring "${substring}" appears exactly once (found ${occurrences} times)`,
                operator: 'actual.split(substring).length === 2'
            });
        }
    }
}