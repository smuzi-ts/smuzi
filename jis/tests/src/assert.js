import * as _assert from "node:assert/strict";

export const assert = {
    equal: _assert.equal,
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
    isStructInstance: (actual, struct) => {

        _assert.fail(``);
        _assert(actual)
    }
}
