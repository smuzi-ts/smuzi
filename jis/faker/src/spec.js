import {
    S,
    TYPE_ARRAY,
    TYPE_BOOL,
    TYPE_FLOAT,
    TYPE_INTEGER,
    TYPE_NAME_FIELD,
    TYPE_STRING,
    TYPE_STRUCT
} from "@jis/std/spec";
import {faker} from "./index.js";
import {match} from "@jis/std";
import {isStruct} from "@jis/std/utils";

export function schema({minFields = 1, maxFields = 5 } = {}) {
    const schema = {};
    const fieldCount = faker.integer(minFields, maxFields);

    for (let i = 0; i < fieldCount; i++) {
        schema[`field${i + 1}`] = faker.obj.getPropertyValue(S)();
    }

    return schema;
}

export function objBySchema(schema) {
    const result = {};

    for (const [key, type] of Object.entries(schema)) {
        if (typeof type === "object") {
            result[key] = objBySchema(type);
            continue;
        }
        match(type[TYPE_NAME_FIELD], [
                [TYPE_STRING, () => result[key] = faker.string()],
                [TYPE_INTEGER, () => result[key] = faker.integer()],
                [TYPE_BOOL, () => result[key] = faker.boolean()],
                [TYPE_FLOAT, () => result[key] = faker.float()],
                [TYPE_ARRAY, () => result[key] = faker.array.items()],
            ],
            () => {
                throw new Error(`Undefined schema type [key=${key}][type=${type}]`)
            },
        )
    }

    return result;
}

export function instanceOfStruct(struct) {
    if (! isStruct(struct)) throw new Exception("Parameter 'struct' is not an instance of a structure")

    const result = {};

    for (const [key, type] of Object.entries(schema)) {
        match(type[TYPE_NAME_FIELD], [
                [TYPE_STRING, () => result[key] = faker.string()],
                [TYPE_INTEGER, () => result[key] = faker.integer()],
                [TYPE_BOOL, () => result[key] = faker.boolean()],
                [TYPE_FLOAT, () => result[key] = faker.float()],
                [TYPE_STRUCT, () => result[key] = instanceOfStruct(type)],
            ],
            () => {
                throw new Error(`Undefined schema type [key=${key}][type=${type}]`)
            },
        )
    }

    return result;
}

export function structName() {
    return faker.string({max: 5, suffix: "Struct"});
}
