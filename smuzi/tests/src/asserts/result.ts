import {asString, json, Result} from "@smuzi/std";
import {assert} from "#lib/assert.js";

export type TAssertResult = {
    failIfError(result: Result<unknown, unknown>),
    failIfOk(result: Result<unknown, unknown>),
}

export const assertResult: TAssertResult = {
    failIfError(result) {
        result.mapErr((e) => {
            assert.fail(asString(e) ? e : json.toString(e).errThen((err) => err.message))
        });
    },
    failIfOk(result) {
        result.mapOk((ok) => {
            assert.fail("Expected result as Err, but get Ok")
        });
    },
}