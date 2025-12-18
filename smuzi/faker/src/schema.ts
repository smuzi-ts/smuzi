import {faker} from "./index.js";
import {dump, match, matchUnknown, None, panic, StdList, StdMap, StdRecord} from "@smuzi/std";
import {
    schema,
    SchemaList,
    SchemaMap,
    SchemaNumber,
    SchemaObject,
    SchemaRecord,
    SchemaRule,
    SchemaString
} from "@smuzi/schema";

function makeObject(rule: SchemaObject) {
    let output = {};

    const config = rule.getConfig();
    for (const field in config) {
        output[field] = make(config[field])
    }

    return output;
}

function makeRecord(rule: SchemaRecord<any>) {
    let output = new StdRecord();

    const config = rule.getConfig();
    for (const field in config) {
        output.set(field, make(config[field]));
    }

    return output;
}

function makeList(rule: SchemaList<any>) {
    let output = new StdList();

    const config = rule.getConfig();
    for (let i = 0; i < 5; i++) {
        output.push(make(config));
    }

    return output;
}

function makeMap(rule: SchemaMap<any, any>) {
    let output = new StdMap();

    const config = rule.getConfig();
    for (let i = 0; i < 5; i++) {
        output.set(i, make(config));
    }

    return output;
}

export function make<S extends SchemaRule>(schemaRule: S): S['__infer'] {
    const map = new Map<(rule) => boolean, (rule) => unknown>([
        [rule => rule instanceof SchemaString, () => faker.string()],
        [rule => rule instanceof SchemaNumber, () => faker.number(),],
        [rule => rule instanceof SchemaObject, makeObject],
        [rule => rule instanceof SchemaRecord, makeRecord],
        [rule => rule instanceof SchemaList, makeList],
        [rule => rule instanceof SchemaMap, makeMap],

    ])

    return matchUnknown(schemaRule, map, () => panic("Not matched " + typeof schemaRule));
}
