import * as primitives from "./primitives.ts"
import * as object from "./obj.js";
import * as array from "./array.js";

export const faker = Object.freeze({
    ...primitives,
    object,
    array,
})