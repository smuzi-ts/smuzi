//TODO: abstraction from Node modules

import * as _assert from "node:assert/strict";
import {AssertionError} from "node:assert";

import {
    None,
    Some,
    Option,
    isOption,
    isString,
    match,
    isObject,
    isImpl,
    isBoolean,
    isNumber,
    isEmpty,
    TEmpty, isArray
} from "@smuzi/std";
import object from "#lib/asserts/object.js";
import array from "#lib/asserts/array.js";
import {assertionError} from "#lib/index.js";


export type Assert = {
    equal: typeof _assert.equal;
    deepEqual: typeof _assert.deepEqual;
    ok: typeof _assert.ok;
    fail: typeof _assert.fail;

    isEmpty: (actual: unknown) => asserts actual is TEmpty,
    isNumber: (actual: unknown) => asserts actual is number,

    isString: (actual: unknown) => asserts actual is string,

    isBoolean: (actual: unknown) => asserts actual is boolean,
    isTrue: (actual: unknown) => asserts actual is true,
    isFalse: (actual: unknown) => asserts actual is false,

    isArray: (actual: unknown) => asserts actual is unknown[],
    arrayHasValue<T>(array: T[], value: unknown): asserts value is T;

    isOption(actual: unknown): asserts actual is Option<unknown>,
    equalSome(actual: Option<unknown>, expectedInnerValue: unknown): asserts actual;
    equalNone(actual: Option<unknown>): asserts actual;

    isObject(actual: unknown): asserts actual is Record<string, unknown>;
    objectHasProperty<T extends Record<string, unknown>>(obj: T, property: keyof T, value?: Option<unknown>);
    objectHasValue<T>(obj: Record<string, T>, value: unknown): asserts value is T;

    isImpl<T>(trait: new () => T, actual: unknown): asserts actual is T;
    isNotImpl<T>(trait: new () => T, actual: unknown): asserts actual is unknown;
};

const signalOk = new Error('__OK__')
const sendSignalOk = () => {
    throw signalOk;
};
const isSignalOk = (actual: unknown) => Object.is(actual, signalOk);

export const assert: Assert = {
    //Native
    equal: _assert.equal,
    deepEqual: _assert.deepEqual,
    ok: _assert.ok,
    fail: _assert.fail,

    ...object,
    ...array,
    isEmpty(actual) {
        if (!isEmpty(actual)) {
            assertionError({
                    message: "Expected TEmpty, but get other",
                    actual,
                    expected: "TEmpty",
                    operator: 'isEmpty'
                }
            )
        }
    },

    //Numbers
    isNumber(actual) {
        if (!isNumber(actual)) {
            assertionError({
                    message: "Expected number, but get other",
                    actual,
                    expected: "number",
                    operator: 'isNumber'
                }
            )
        }
    },

    //Strings
    isString(actual) {
        if (!isString(actual)) {
            assertionError({
                    message: "Expected string, but get other",
                    actual,
                    expected: "string",
                    operator: 'isString'
                }
            )
        }
    },

    //Booleans
    isBoolean(actual) {
        if (!isBoolean(actual)) {
            assertionError({
                    message: "Expected boolean, but get other",
                    actual,
                    expected: "boolean",
                    operator: 'isBoolean'
                }
            )
        }
    },
    isTrue: (actual) => _assert.equal(actual, true),
    isFalse: (actual) => _assert.equal(actual, false),

    isOption: (actual) => {
        if (!isOption(actual)) {
            assertionError({
                    message: "Expected Option, but get other",
                    actual,
                    expected: "Option",
                    operator: 'isOption'
                }
            )
        }
    },
    equalSome(actual: Option<unknown>, expectedInnerValue: unknown = None()) {
        actual.match({
            Some: (val) => {
                assert.equal(val, expectedInnerValue);
            },
            None: () => {
                assert.fail("Expected Some, but get None")
            }
        })
    },
    equalNone(actual: Option<unknown>) {
        actual.match({
            Some: (_) => {
                assert.fail("Expected None, but get Some")
            },
            None: () => {
            }
        })
    },

    isImpl(trait, actual) {
        assert.ok(isImpl(trait, actual), "Expected that object is implemented trait");
    },

    isNotImpl(trait, actual) {
        assert.ok(!isImpl(trait, actual), "Expected that object is NOT implemented trait");
    },
}
