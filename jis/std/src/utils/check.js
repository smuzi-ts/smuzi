import {TYPE_NAME_FIELD} from "#lib/spec/schema.ts";
import {STRUCT_NAME_FIELD, TYPE_STRUCT, TYPE_STRUCT_INSTANCE} from "#lib/spec/struct.ts";

export function isNone(val) {
    return val === undefined || val === null;
}

export function isEmpty(val) {
    return isNone(val) || val === "" || (Array.isArray(val) && val.length === 0);
}

export function isString(val) {
    return typeof val === "string";
}

export function isBool(val) {
    return typeof val === "boolean";
}

export function isInteger(val) {
    return Number.isInteger(val);
}

export function isFunction(val) {
    return typeof val === "function";
}

export function isArray(val) {
    return Array.isArray(val);
}

export function isObject(val) {
    return Object.prototype.toString.call(val) === "[object Object]";

}

export function isStruct(val) {
    return val?.[TYPE_NAME_FIELD] === TYPE_STRUCT;
}

export function isStructInstance(val, struct = undefined) {
    const isStructInstance = val?.[TYPE_NAME_FIELD] === TYPE_STRUCT_INSTANCE;
    if (struct === undefined) return isStructInstance;

    return val[STRUCT_NAME_FIELD] === struct[STRUCT_NAME_FIELD];
}