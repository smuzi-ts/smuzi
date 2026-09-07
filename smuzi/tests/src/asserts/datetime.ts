import {AssertionError} from "node:assert";
import {isArray, isNumber} from "@smuzi/std";
import {assertionError} from "#lib/index.js";

export type AssertDatetime = {
    isNative(actual: unknown): asserts actual is Date
}

export const assertDatetime: AssertDatetime = {
    isNative(actual) {
        if (! (actual instanceof Date)) {
            assertionError({
                    message: "Expected Date, but get other",
                    actual,
                    expected: "Date",
                    operator: 'instanceof'
                }
            )
        }
    },
}