import {asString, json, Result} from "@smuzi/std";
import {assert} from "#lib/assert.js";

export type TAssertResult = {
    failIfError(result: Result<unknown, unknown>),
}

export const assertResult: TAssertResult = {
    failIfError(result) {
        result.wrapErr((e) => {
            assert.fail(asString(e) ? e : json.toString(e))
        });
    },
}