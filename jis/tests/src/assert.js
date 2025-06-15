import * as _assert from "node:assert/strict";
import {isStructInstance, validationSchema} from "@jis/std/spec";
import {AssertionError} from "node:assert";
import {isEmpty, isNone} from "@jis/std/utils";

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
        if (! validationSchema(schema)(obj).isOk) _assert.fail('Object does not match schema');
    },
    objIsInvalidBySchema: (schema, obj) => {
        if (validationSchema(schema)(obj).isOk) _assert.fail('Object unexpectedly matched schema');
    },

    //Errors/Exceptions
    expectError: (error, fn) => {
        try {
            const call = typeof error === "function"
            fn();

            _assert.fail('Object unexpectedly matched schema')
        } catch (e) {

        }
    }

}
