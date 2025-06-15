import {readonly, Result} from "#lib/prelude.js";
import {pipe} from "#lib/utils.js";
import {isStructInstance, TYPE_STRUCT} from "#lib/spec/struct.ts";

export const TYPE_NAME_FIELD = Symbol('TYPE_NAME_FIELD');
export const TYPE_INTEGER = Symbol('integer');
export const TYPE_FLOAT = Symbol('float');
export const TYPE_STRING = Symbol('string');
export const TYPE_BOOL = Symbol('bool');

const assignTypeName = (typeId, checker) => {
    checker[TYPE_NAME_FIELD] = typeId;

    return checker;
}

const integer = (mistmatchedTypes = baseMistmatchedTypes)  => {
    return assignTypeName(
        TYPE_INTEGER,
        (val) => Number.isInteger(val) ? Result.Ok(val) : Result.Err(mistmatchedTypes(typeof val, "integer"))
    )
}

//TODO
const float = (mistmatchedTypes = baseMistmatchedTypes) => {
    const checker = baseCheckType('number', mistmatchedTypes);

    return assignTypeName(TYPE_FLOAT, checker);
}

const string = (mistmatchedTypes = baseMistmatchedTypes) => {
    const checker = (val) => {
        const realType = typeof val;
        return realType === "string" ? Result.Ok(true) : Result.Err(mistmatchedTypes(realType, "string"))
    }

    assignTypeName(TYPE_STRING, checker);

    return checker;
}

const bool = (mistmatchedTypes = baseMistmatchedTypes) => {
    const checker = baseCheckType('boolean', mistmatchedTypes);

    return assignTypeName(TYPE_BOOL, checker);
}

export const Schema = {
    string,
    bool,
    integer,
    float,
}

export const S = Schema;

const baseCheckType =
    (expectedType, mistmatchedTypes) =>
        (val) => {
            const realType = typeof val;
            return realType === expectedType ? Result.Ok(true) : Result.Err(mistmatchedTypes(realType, expectedType))
        }

const baseMistmatchedTypes = (realType, expectedType) => {
    return `Expected ${expectedType}, found ${realType}`
}

export function validationSchema(schema){
    return (obj) => {
        const err: ValidationErrors = {};
        let isValid = true;

        for (const varName in schema) {
            const check = isStructInstance(schema[varName]) ?
                validationSchema(schema[varName])(obj[varName]) :
                schema[varName](obj[varName]);

            if (! check.isOk) {
                isValid = false;
                err[varName] = check.err;
            }
        }

        return isValid ? Result.Ok(obj) : Result.Err(err);
    };
}


type ValidationErrors = Record<string, string>;