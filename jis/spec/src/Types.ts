import {Result} from "./dataTypes/Result.ts";

export const TYPE_NAME_FIELD = Symbol('TYPE_NAME_FIELD');
export const TYPE_INTEGER = Symbol('integer');
export const TYPE_FLOAT = Symbol('float');
export const TYPE_STRING = Symbol('string');
export const TYPE_BOOL = Symbol('bool');

const integer = (mistmatchedTypes = baseMistmatchedTypes) =>
    (val) => {
        return Number.isInteger(val) ? Result.Ok(true) : Result.Err(mistmatchedTypes(typeof val, "integer"))
    }
integer[TYPE_NAME_FIELD] = TYPE_INTEGER;

//TODO
const float = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('number', mistmatchedTypes)
float[TYPE_NAME_FIELD] = TYPE_FLOAT;

const string = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('string', mistmatchedTypes)
string[TYPE_NAME_FIELD] = TYPE_STRING;

const bool = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('boolean', mistmatchedTypes)
bool[TYPE_NAME_FIELD] = TYPE_BOOL;


export const S = {
    string,
    bool,
    integer,
    float,
}

const baseCheckType =
    (expectedType, mistmatchedTypes) =>
        (val) => {
            const realType = typeof val;
            return realType === expectedType ? Result.Ok(true) : Result.Err(mistmatchedTypes(realType, expectedType))
        }

const baseMistmatchedTypes = (realType, expectedType) => {
    return `Expected ${expectedType}, found ${realType}`
}
