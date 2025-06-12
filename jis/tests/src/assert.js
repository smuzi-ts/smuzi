import * as _assert from "node:assert/strict";
import {isStructInstance, validationSchema} from "@jis/spec";

export const assert = {
    //Native
    equal: _assert.equal,
    deepEqual: _assert.deepEqual,

    //Booleans
    isTrue: (actual) => _assert.equal(actual, true),
    isFalse: (actual) => _assert.equal(actual, true),
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
        _assert.ok(isStructInstance(actualInstance, structInterface), `Bad structure`);
    },
    //Schema
    objIsValidBySchema: (schema, obj) => {
        if (! validationSchema(schema, obj).isOk) _assert.fail('Object does not match schema');
    },
    objIsInvalidBySchema: (schema, obj) => {
        if (validationSchema(schema, obj).isOk) _assert.fail('Object unexpectedly matched schema');
    }
}
