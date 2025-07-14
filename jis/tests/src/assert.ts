import * as _assert from "node:assert/strict";

export type Assert = {
  equal: typeof _assert.equal;
  deepEqual: typeof _assert.deepEqual;
  ok: typeof _assert.ok;
  fail: typeof _assert.fail;
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
}
