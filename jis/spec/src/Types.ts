import {Result} from "./dataTypes/Result.ts";

const integer = (mistmatchedTypes = baseMistmatchedTypes) =>
    (val) => {
        return Number.isInteger(val) ? true : mistmatchedTypes(typeof val, "integer")
    }

const number = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('number', mistmatchedTypes)

//TODO
const float = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('number', mistmatchedTypes)

const string = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('string', mistmatchedTypes)

const bool = (mistmatchedTypes = baseMistmatchedTypes) =>
    baseCheckType('boolean', mistmatchedTypes)


export const S = {
    string,
    bool,
    integer,
    number,
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
