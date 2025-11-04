import {AssertionError} from "node:assert";
import {isObject, None} from "@smuzi/std";
import {assert} from "#lib/assert.ts";

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
        this.isObject(actual);

        // Some objects are created without a prototype (e.g., Object.create(null)),
        // so they do not have the hasOwnProperty method. Use Object.prototype.hasOwnProperty.call(...) instead.
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
        this.isObject(obj);

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