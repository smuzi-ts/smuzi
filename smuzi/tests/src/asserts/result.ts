import {asString, isSome, json, None, Option, Result} from "@smuzi/std";
import {assert} from "#lib/assert.js";

export type TAssertResult = {
    equalOk(result: Result, expectedOk?: Option),
    equalErr(result: Result, expectedErr?: Option),
}

export const assertResult: TAssertResult = {
    equalOk(result, expectedOk = None()) {
        result.match({
            Ok(ok) {
                expectedOk.mapSome(expected => {
                    assert.deepEqual(ok, expected);
                    return true;
                })
            },
            Err(err) {
                assert.fail(asString(err) ? err : json.toString(err).errThen((e) => e.message))
            }
        })

    },
    equalErr(result, expectedErr = None()) {
        result.match({
            Ok(ok) {
                assert.fail("Expected result as Err, but get Ok")
            },
            Err(err) {
                expectedErr.mapSome(expected => {
                    assert.deepEqual(err, expected);
                    return true;
                })
            }
        })
    },
}