import * as _assert from "node:assert/strict";
import {validationSchema} from "@jis/std/spec";
import {AssertionError} from "node:assert";
import {isEmpty, isFunction, isNone, isStructInstance} from "@jis/std/utils";

export const assert = {
    //Native
    equal: _assert.equal,
    deepEqual: _assert.deepEqual,
    ok: _assert.ok,
    fail: _assert.fail,

    isNone: (actual) => {
        _assert.ok(isNone(actual), new AssertionError(
            {
                actual: actual,
                expected: "none",
                message: "Not is none"
            }
        ));
    },
    isEmpty: (actual) => {
        _assert.ok(isEmpty(actual), new AssertionError(
            {
                actual: actual,
                expected: "none",
                message: "Not is none"
            }
        ));
    },
    //Booleans
    isTrue: (actual) => _assert.equal(actual, true),
    isFalse: (actual) => _assert.equal(actual, false),
    isBoolean: (actual) => _assert.equal(typeof actual, "boolean"),

    //Strings
    isString: (actual) => _assert.equal(typeof actual, "string"),

    //Numbers
    isNumber: (actual) => _assert.equal(typeof actual, "number"),
    isInteger: (actual) => {
        return _assert.ok(Number.isInteger(actual))
    },
    isFloat: (actual) => _assert.equal(typeof actual, "number"),
    //Structures
    isStructInstance: (actualInstance, structInterface) => {
        _assert.ok(isStructInstance(actualInstance, structInterface), new AssertionError(
            {
                actual: actualInstance,
                expected: structInterface,
                message: "Data does not match the expected schema"
            }
        ));
    },
    //Schema
    objIsValidBySchema: (schema, obj) => {
        if (! validationSchema(schema)(obj).isOk()) {
            throw new AssertionError({
                message: `Expected object to match the schema, but validation failed`,
                actual: obj,
                expected: schema,
                operator: 'validationSchema'
            })
        }
    },
    objIsInvalidBySchema: (schema, obj) => {
        if (validationSchema(schema)(obj).isOk()) {
            throw new AssertionError({
                message: `Expected object NOT to match the schema, but validation succeeded`,
                actual: obj,
                expected: schema,
                operator: 'validationSchema'
            })
        }
    },

    //Errors
    expectResultErr: (result, expectedErr = undefined) => {
        if(result.isOk()) _assert.fail('Expected error, but got ok');

        if (expectedErr !== undefined) {
            assert.deepEqual(result.val, expectedErr);
        }
    },

    expectException: (errOrFn, fn) => {
        let expectedErr = errOrFn;
        try {
            if (isFunction(errOrFn)) {
                fn = errOrFn;
                expectedErr = Error;
            }

            fn();
        } catch (actualErr) {
            if (!actualErr instanceof expectedErr) {
                throw new AssertionError({
                    message: `Expected error to be instance of ${expectedErr.name}, but got ${actualErr.constructor.name}`,
                    actual: actualErr,
                    expected: expectedErr,
                    operator: 'instanceof'
                })
            }
        }
    }
}
