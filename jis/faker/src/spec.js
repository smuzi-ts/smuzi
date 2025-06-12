import {S} from "@jis/spec";
import {faker} from "./index.js";

export function schema(minFields = 1, maxFields = 5) {
    const schema = {};
    const fieldCount = faker.integer(minFields, maxFields);

    for (let i = 0; i < fieldCount; i++) {
        const fieldName = `field${i + 1}`;
        const randomTypeKey = faker.obj.getProperty(S);
        schema[fieldName] = S[randomTypeKey];
    }

    return schema;
}

export function objBySchema(schema) {
    const result = {};

    for (const [key, typeFn] of Object.entries(schema)) {
        if (typeFn === S.string) result[key] = faker.string();
        else if (typeFn === S.bool) result[key] = faker.boolean();
        else if (typeFn === S.integer) result[key] = faker.integer();
        else if (typeFn === S.float) result[key] = faker.float();
        else {
            throw new Error(`Undefined schema type [key=${key}][type=${typeFn}]`)
        }
    }

    return result;
}
