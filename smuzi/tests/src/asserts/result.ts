import {asString, isSome, None, Option, Result, StdJson, transformError} from "@smuzi/std";
import {assert} from "../assert.js";

export type TAssertResult = {
    equalOk(result: Result, expectedOk?: Option),
    equalErr(result: Result, expectedErr?: Option),
    fail(err: unknown),
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
                assert.fail("Expected result as Ok, but get Err: " + transformError(err).message);
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
    fail(err: unknown) {
        assert.fail("Expected result as Ok, but get Err: " + transformError(err).message);
    }
}