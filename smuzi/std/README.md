# @smuzi/std

A lightweight standard library for JavaScript and TypeScript.

Provides core functionality and utility methods for working with **Pattern Matching**, **Option**, **Result** , **env**, and many more.

---

## Installation

```bash
npm install @smuzi/std
```

---

## Examples

```ts
const handlers = new Map([
    ["A", "isA"],
    ["B", "isB"],
    ["C", "isC"],
]);

const result = match("B", handlers, "isDefault")
assert.equal(result, "isB")
```
