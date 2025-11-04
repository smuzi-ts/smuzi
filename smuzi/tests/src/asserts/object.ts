import {AssertionError} from "node:assert";
import {isObject, None} from "@smuzi/std";
import {assert} from "#lib/assert.js";

export default {
    isObject(actual) {
        if (!isObject(actual)) {
            throw new AssertionError({
                    message: "Expected Object, but get other",
                    actual,
                    expected: "Object",
                    operator: 'isObject'
                }
            )
        }
    },
    objectHasProperty(actual, property, value = None()) {
        assert.ok(Object.prototype.hasOwnProperty.call(actual, property), "Expected that object has property " + property)

        value.match({
            Some: (expected) => {
                assert.equal(actual[property], expected);
            },
            None: () => {
            },
        });
    },
    objectHasValue(obj, value) {
        if (! Object.values(obj).includes(value)) {
            throw new AssertionError({
                    message: "Expected object has value",
                    actual: obj,
                    expected: value,
                    operator: 'Object.values(obj).includes(value)'
                }
            )
        }

    }
}