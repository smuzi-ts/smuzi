import * as _assert from "node:assert/strict";
import {AssertionError} from "node:assert";
import {None, Some, Option} from "@jis/std";

export type Assert = {
  equal: typeof _assert.equal;
  deepEqual: typeof _assert.deepEqual;
  ok: typeof _assert.ok;
  fail: typeof _assert.fail;
  equalSome(actual: Option<unknown>, expectedInnerValue: unknown): asserts actual;
  equalNone(actual: Option<unknown>): asserts actual;
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
    }
}
