import {type IResult, Result} from "./Result.ts";
import {readonly} from "@jis/std";
import {pipe} from "@jis/std/utils";

export const STRUCT_NAME_FIELD = Symbol('STRUCT_NAME_FIELD');

export const isStructInstance = (obj: any, struct = undefined) => {
    const isStructInstance = obj.hasOwnProperty(STRUCT_NAME_FIELD);
    if (struct === undefined) return isStructInstance;

    return obj[STRUCT_NAME_FIELD] === struct[STRUCT_NAME_FIELD];
}

export const validationSchema = (schema) => (obj) => {
    const err: ValidationErrors = {};
    let isValid = true;

    for (const varName in schema) {
        const check = schema[varName]()(obj[varName]);

        if (! check.isOk) {
            isValid = false;
            err[varName] = check.err;
        }
    }

    return isValid ? Result.Ok(obj) : Result.Err(err);
};

export const BStruct = (validation) => (schema: {}, structName = 'NoNamedStruct') => {
    const structNameUnique = generateStructNameUnique(structName)

    const instanceBuilder: IStructBuilder = pipe(
        assignStructNameToObj(structNameUnique),
        readonly,
        validation(schema),
        (result) => {
            throwIfFailValidation(result, structName);

            return result.ok;
        }
    );

    instanceBuilder[STRUCT_NAME_FIELD] = structNameUnique;

    return instanceBuilder;
}

export const Struct = BStruct(validationSchema);

// export const UnsafeStruct = (schema: {}, structName = 'NoNamedUnsafeStruct' , {validation = validationSchema} = {}) => {
//     const structNameUnique = Symbol(structName)
//
//     const builder: IUnsafeStructBuilder = (obj) => {
//         const newObj = readonly(clone({[STRUCT_NAME_FIELD]: structNameUnique}, obj));
//
//         const err = validation(schema, obj);
//         if (err !== null) {
//             return Result.Err(err);
//         }
//
//         return Result.Ok(newObj);
//     };
//
//     builder[STRUCT_NAME_FIELD] = structNameUnique;
//
//     return builder;
// }

const generateStructNameUnique = (structName = "") => Symbol(structName);

const assignStructNameToObj = (structNameUnique) => (obj) => Object.assign({[STRUCT_NAME_FIELD]: structNameUnique}, obj);

const throwIfFailValidation = (validationResult, structName) => {
    if (! validationResult.isOk) {
        throw new StructValidationException(structName, validationResult.err);
    }
}

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
