import * as _assert from "node:assert/strict";
import {AssertionError} from "node:assert";
import {None, Some, Option, isOption, isString, match, isObject} from "@jis/std";

export type Assert = {
  equal: typeof _assert.equal;
  deepEqual: typeof _assert.deepEqual;
  ok: typeof _assert.ok;
  fail: typeof _assert.fail;

  isTrue: (actual: unknown) => asserts actual is true,
  isFalse: (actual: unknown) => asserts actual is false,
    
  isOption(actual: unknown): asserts actual is Option<unknown>,
  equalSome(actual: Option<unknown>, expectedInnerValue: unknown): asserts actual;
  equalNone(actual: Option<unknown>): asserts actual;

  isObject(actual: unknown): asserts actual is Record<string, unknown>;
  objHasProperty(actual: unknown, property: string, value: Option<unknown>);
};

const signalOk = new Error('__OK__')
const sendSignalOk = () => { throw signalOk; };
const isSignalOk = (actual: unknown) => Object.is(actual, signalOk);

export const assert: Assert = {
    //Native
    equal: _assert.equal,
    deepEqual: _assert.deepEqual,
    ok: _assert.ok,
    fail: _assert.fail,

    ///Booleans
    isTrue: (actual) => _assert.equal(actual, true),
    isFalse: (actual) => _assert.equal(actual, false),

    isOption: (actual) => {
      if (! isOption(actual)) {
        throw new AssertionError({
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
        None: () => {}
      })
    },
    isObject(actual) {
      if (! isObject(actual)) {
        throw new AssertionError({
                message: "Expected Object, but get other",
                actual,
                expected: "Object",
                operator: 'isObject'
            }
          )
      }
    },
    objHasProperty(actual, property, value = None()) {
      assert.isObject(actual);

      // Some objects are created without a prototype (e.g., Object.create(null)),
      // so they do not have the hasOwnProperty method. Use Object.prototype.hasOwnProperty.call(...) instead.
      assert.ok(Object.prototype.hasOwnProperty.call(actual, property), "Expected wa object has property " + property)
    
      value.match({
        Some: (expected) => {
           assert.equal(actual[property], expected);
        },
        None: () => {},
      });
    }
}
