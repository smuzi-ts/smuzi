import * as primitives from "./primitives.js"
import * as object from "./obj.js";
import * as array from "./array.js";
import * as datetime from "./datetime.js";

export const faker = Object.freeze({
    ...primitives,
    ...datetime,
    object,
    array,
})