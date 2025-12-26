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
    isBoolean,
    isNumber,
    isEmpty,
    TEmpty, isArray,
    isSome,
    StdError,
    asString, dump
} from "@smuzi/std";
import {assertObject, TAssertObject} from "#lib/asserts/object.js";
import {assertArray, TAssertArray} from "#lib/asserts/array.js";
import {assertionError} from "#lib/index.js";
import {assertResult, TAssertResult} from "#lib/asserts/result.js";
import {assertString, TAssertString} from "#lib/asserts/string.js";
import {AssertDatetime, assertDatetime} from "#lib/asserts/datetime.js";
import {assertSchema, AssertSchema} from "#lib/asserts/schema.js";


export type Assert = {
    equal: typeof _assert.equal;
    deepEqual: typeof _assert.deepEqual;
    ok: typeof _assert.ok;
    fail(err: string | StdError | AssertionError): never;

    isEmpty: (actual: unknown) => asserts actual is TEmpty,
    isNotNullable: (actual: unknown) => asserts actual is NonNullable<unknown>,

    isNumber: (actual: unknown) => asserts actual is number,

    isString: (actual: unknown) => asserts actual is string,

    isBoolean: (actual: unknown) => asserts actual is boolean,
    isTrue: (actual: unknown) => asserts actual is true,
    isFalse: (actual: unknown) => asserts actual is false,

    isArray: (actual: unknown) => asserts actual is unknown[],

    isOption(actual: unknown): asserts actual is Option,
    isSome(actual: unknown): asserts actual is Option,
    
    equalSome(actual: unknown, expectedInnerValue: unknown): asserts actual is Option;
    equalNone(actual: unknown): asserts actual is Option;

    isObject(actual: unknown): asserts actual is Record<string, unknown>;

    result: TAssertResult
    array: TAssertArray
    object: TAssertObject
    string: TAssertString
    datetime: AssertDatetime
    schema: AssertSchema
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
    fail(err) {
        throw err;
    },

    object: assertObject,
    array: assertArray,
    result: assertResult,
    string: assertString,
    datetime: assertDatetime,
    schema: assertSchema,

    isEmpty(actual) {
        if (! isEmpty(actual)) {
            assertionError({
                    message: "Expected TEmpty, but get other",
                    actual,
                    expected: "TEmpty",
                    operator: 'isEmpty'
                }
            )
        }
    },

    isNotNullable(actual) {
        if (isEmpty(actual)) {
            assertionError({
                    message: "Expected NotNullable, but get nullable",
                    actual,
                    expected: "NotNullable",
                    operator: 'isEmpty'
                }
            )
        }
    },

    //Numbers
    isNumber(actual) {
        if (! isNumber(actual)) {
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

    isArray(actual) {
        if (!isArray(actual)) {
            assertionError({
                    message: "Expected array, but get other",
                    actual,
                    expected: "array",
                    operator: 'isArray'
                }
            )
        }
    },
    isObject(actual) {
        if (!isObject(actual)) {
            assertionError({
                    message: "Expected object, but get other",
                    actual,
                    expected: "object",
                    operator: 'isObject'
                }
            )
        }
    },
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

    isSome: (actual) => {
        if (! isSome(actual)) {
            assertionError({
                    message: "Expected OptionSome, but get other",
                    actual,
                    expected: "OptionSome",
                    operator: 'isSome'
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
}
