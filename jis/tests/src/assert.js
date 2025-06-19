import * as _assert from "node:assert/strict";
import {StructValidationException, validationSchema} from "@jis/std/spec";
import {AssertionError} from "node:assert";
import {isEmpty, isFunction, isNone, isStructInstance} from "@jis/std/utils";
import {getClass} from "@jis/std";

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
    strStartsWith: (actual, prefix = "") => {
        assert.isString(actual);

        _assert.ok(actual.startsWith(prefix), new AssertionError(
            {
                actual: actual,
                expected: `${prefix}*`,
                message: `Expected string to start with "${prefix}", but got "${actual}"`,
                operator: "startsWith"
            }
        ));
    },
    strEndsWith: (actual, suffix = "") => {
        assert.isString(actual);

        _assert.ok(actual.endsWith(suffix), new AssertionError(
            {
                actual: actual,
                expected: `*${suffix}`,
                message: `Expected string to end with "${suffix}", but got "${actual}"`,
                operator: "endsWith"
            }
        ));
    },
    strContains: (actual, searchElement = "") => {
        assert.isString(actual);

        _assert.ok(actual.includes(searchElement), new AssertionError(
            {
                actual: actual,
                expected: `*${searchElement}*`,
                message: `Expected string to contain "${searchElement}", but got "${actual}"`,
                operator: "includes"
            }
        ));
    },


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

    expectAnyErrors: (fn) => {
        const errorOk = new Error('__OK__');

        try {
            fn();
            throw errorOk;
        } catch (actualErr) {
            if (actualErr === errorOk) {
                throw new AssertionError({
                    message: `Expected any errors, but got error ${getClass(actualErr)}`,
                    actual: actualErr,
                    expected: "any errors",
                    operator: ''
                })
            }
        }
    },

    expectErrorInstOf: (expectedErrChecker, fn) => {
        try {
            fn();
            throw new Error('__OK__');
        } catch (actualErr) {
            if (! expectedErrChecker(actualErr)) {
                throw new AssertionError({
                    message: `Expected error to be instance of via checker, but got error ${getClass(actualErr)}`,
                    actual: actualErr,
                    expected: "",
                    operator: 'checker'
                })
            }
        }
    }
}
