import * as primitives from "./primitives.js"
import * as object from "./obj.js";
import * as array from "./array.js";
import * as datetime from "./datetime.js";
import * as repeat from "./repeat.js";
import * as schema from "./schema.js";

export const faker = Object.freeze({
    ...primitives,
    object,
    array,
    repeat,
    schema,
    datetime,
})