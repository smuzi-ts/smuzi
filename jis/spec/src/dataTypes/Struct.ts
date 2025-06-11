import {type IResult, Result} from "./Result.ts";

export const STRUCT_NAME_FIELD = Symbol('STRUCT_NAME_FIELD');

export const isStruct = (obj: any) => {
    return obj.hasOwnProperty(STRUCT_NAME_FIELD);
}

export const Struct = (schema: {}, structName = 'NoNamedStruct' , {validation = validationSchema} = {}) => {
    const structNameUnique = Symbol(structName)

    const builder: IStructBuilder = (obj) => {
        const newObj = Object.freeze(Object.assign({[STRUCT_NAME_FIELD]: structNameUnique}, obj));

        const validationResult = validation(schema, obj);

        if (! validationResult.isOk) {
            throw new StructValidationException(structName, validationResult.err);
        }

        return newObj;
    };

    builder[STRUCT_NAME_FIELD] = structNameUnique;

    return builder;
}

export const UnsafeStruct = (schema: {}, structName = 'NoNamedUnsafeStruct' , {validation = validationSchema} = {}) => {
    const structNameUnique = Symbol(structName)

    const builder: IUnsafeStructBuilder = (obj) => {
        const newObj = Object.freeze(Object.assign({[STRUCT_NAME_FIELD]: structNameUnique}, obj));

        const err = validation(schema, obj);
        if (err !== null) {
            return Result.Err(err);
        }

        return Result.Ok(newObj);
    };

    builder[STRUCT_NAME_FIELD] = structNameUnique;

    return builder;
}


export const validationSchema = (schema, data) => {
    const err: ValidationErrors = {};
    let isValid = true;

    for (const varName in schema) {
        const check = schema[varName](data[varName]);

        if (! check.isOk) {
            isValid = false;
            err[varName] = check.err;
        }
    }

    return isValid ? Result.Ok(null) : Result.Err(err);
};


/**
 * Declare types
 */

type IStructBuilder = <S extends Record<string, any>>(obj: S) => Readonly<S>
type IUnsafeStructBuilder = <S extends Record<string, any>>(obj: S) => IResult<Readonly<S>, any>

type CheckResult = true | string;

type ValidationErrors = Record<string, string>;

class StructValidationException extends Error {
    #errDetails = {};
    #structName = "";

    constructor(structName, err: ValidationErrors) {
        super(`Struct '${structName}' : ` +  JSON.stringify(err));
        this.#errDetails = err;
        this.#structName = structName;
    }

    get errDetails() {
        return this.#errDetails;
    }
}
