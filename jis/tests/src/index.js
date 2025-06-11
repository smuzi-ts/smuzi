export { describe, it } from "node:test";
import * as _assert from "node:assert/strict";

_assert.equalTrue = (actual) => _assert.strictEqual(actual, true);

export const assert = _assert;