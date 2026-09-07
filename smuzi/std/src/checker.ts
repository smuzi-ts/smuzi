import {StdRecord} from "#lib/record.js";
import {StdMap} from "#lib/map.js";
import {StdList} from "#lib/list.js";

export type TEmpty = null | undefined | '' | never[];

export function asString(val: unknown): val is string {
    return typeof val === "string";
}

export function asNumber(val: unknown): val is number {
    return typeof val === "number";
}

export function asBool(val: unknown): val is boolean {
    return typeof val === "boolean";
}

export function asFunction(val: unknown): val is Function {
    return typeof val === "function";
}

export function asArray<T = unknown>(val: unknown): val is T[] {
    return Array.isArray(val);
}

export function asObject(val: unknown): val is Record<PropertyKey, unknown> {
    return typeof val === "object" && val !== null && !Array.isArray(val);
}

export function asRecord(val: unknown): val is StdRecord<Record<PropertyKey, unknown>> {
    return val instanceof StdRecord;
}

export function asMap(val: unknown): val is StdMap {
    return val instanceof StdMap;
}

export function asRegExp(val: unknown): val is RegExp {
    return val instanceof RegExp;
}

export function asEmpty(val: unknown): val is TEmpty
{
    return isEmpty(val);
}

export function asNull(val: unknown): val is null|undefined {
    return val === undefined || val === null;
}

export function isNull(val: unknown): boolean {
    return val === undefined || val === null;
}

export function isEmpty(val: unknown): boolean {
    return isNull(val) || val === "" || (Array.isArray(val) && val.length === 0);
}

export function isString(val: unknown): boolean {
    return typeof val === "string";
}


export function isNumber(val: unknown): boolean {
    return typeof val === "number";
}

export function isBoolean(val: unknown): boolean {
    return typeof val === "boolean";
}

export function isInteger(val: unknown): boolean {
    return Number.isInteger(val);
}

export function isFunction(val: unknown): boolean {
    return typeof val === "function";
}

export function isArray(val: unknown): boolean {
    return Array.isArray(val);
}

export function isObject(val: unknown): boolean {
    return asObject(val);
}

export function isRegExp(val: unknown): boolean {
    return val instanceof RegExp;
}

export function isIterable(val: unknown): val is Iterator<any> {
    return val != null && typeof val[Symbol.iterator] === "function";
}

export function asList(val: unknown): val is StdList {
    return val instanceof StdList;
}
