import * as primitives from "./primitives.js"
import * as obj from "./obj.js";
import * as array from "./array.js";

export const faker = Object.freeze({
    ...primitives,
    obj,
    array,
})