import {Result} from "#lib/prelude.js";
import {isArray, isInteger, isStruct, isStructInstance} from "#lib/utils.js";
import {STRICT_MODE_DISABLE} from "#lib/spec/struct.ts";

export const TYPE_NAME_FIELD = Symbol('TYPE_NAME_FIELD');
export const TYPE_INTEGER = Symbol('integer');
export const TYPE_FLOAT = Symbol('float');
export const TYPE_STRING = Symbol('string');
export const TYPE_BOOL = Symbol('bool');
export const TYPE_ARRAY = Symbol('array');

const assignTypeName = (typeId, checker) => {
    checker[TYPE_NAME_FIELD] = typeId;
    return checker;
}

const integer = (mistmatchedTypes = baseMistmatchedTypes)  => {
    return assignTypeName(
        TYPE_INTEGER,
        (val) => isInteger(val) ? Result.Ok(val) : mistmatchedTypes(typeof val, "integer")
    );
}

//TODO
const float = (mistmatchedTypes = baseMistmatchedTypes) =>
     assignTypeName(TYPE_FLOAT, baseCheckType('number', mistmatchedTypes));

const string = (mistmatchedTypes = baseMistmatchedTypes) =>
     assignTypeName(TYPE_STRING, baseCheckType('string', mistmatchedTypes));

const bool = (mistmatchedTypes = baseMistmatchedTypes) =>
    assignTypeName(TYPE_BOOL, baseCheckType('boolean', mistmatchedTypes));

const array = (mistmatchedTypes = baseMistmatchedTypes) => {
    return assignTypeName(
        TYPE_ARRAY,
        (val) => isArray(val) ? Result.Ok(val) : mistmatchedTypes(typeof val, "array")
    );
}

const arrayOfStrings = (mistmatchedTypes = baseMistmatchedTypes) => {
    return assignTypeName(
        TYPE_ARRAY,
        (val) => isArray(val) ? Result.Ok(val) : mistmatchedTypes(typeof val, "array")
    );
}

export const Schema = {
    string,
    bool,
    integer,
    float,
    array,
    arrayOfStrings,
}

export const S = Schema;

const baseCheckType =
    (expected, mistmatchedTypes) =>
        (val) => {
            const actual = typeof val;
            return actual === expected ? Result.Ok(val) : mistmatchedTypes(actual, expected);
        }

const baseMistmatchedTypes = (actual, expected) => {
    return Result.Err({actual, expected});
}

export function validationSchema(schema) {
    return (obj) => {
        const err: ValidationErrors = {};
        let isValid = true;

        let checkResult;
        for (const varName in schema) {
            if (isStruct(schema[varName])) {
                checkResult = schema[varName](obj[varName], STRICT_MODE_DISABLE);
            } else {
                checkResult = schema[varName](obj[varName]);
            }

            if (! checkResult.isOk()) {
                isValid = false;
                err[varName] = checkResult.val;
            }
        }

        return isValid ? Result.Ok(obj) : Result.Err(err);
    };
}


type ValidationErrors = Record<string, string>;