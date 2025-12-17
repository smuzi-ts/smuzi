# @smuzi/std

A lightweight standard library for JavaScript and TypeScript.

Provides core functionality and utility methods for working with **Patterns Matching**, **Option**, **Result** , **env**, and many more.

---

## Installation

```bash
npm install @smuzi/std
```

---
> See more examples in the [tests folder](./tests).

## Patterns Matching

```ts
const handlers = new Map([
    ["A", "isA"],
    ["B", "isB"],
    ["C", "isC"],
]);

const result = match("B", handlers, "isDefault")
assert.equal(result, "isB")
```
