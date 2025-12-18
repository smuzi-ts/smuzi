import {faker} from "./index.js";
import {match, None} from "@smuzi/std";
import {schema, SchemaNumber, SchemaObject, SchemaRule, SchemaString} from "@smuzi/schema";

function makeObject(schemaRule: SchemaObject) {
    return
}

export function make<S extends SchemaRule>(schemaRule: S): S['__infer'] {
    let input;

    const map = new Map<any, any>([
        [rule => rule instanceof SchemaString, () => faker.string()],
        [rule => rule instanceof SchemaNumber, () => faker.number(),],
        [rule => rule instanceof SchemaObject, () => faker.number(),],
    ])



    return match(schemaRule, map, None());
}
