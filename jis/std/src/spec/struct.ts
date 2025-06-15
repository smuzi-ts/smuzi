import {type IResult, Result} from "#lib/dataTypes/result.ts";
import {failIf, readonly} from "#lib/prelude.js";
import {isEmpty, isString, pipe} from "#lib/utils.js";
import {TYPE_NAME_FIELD, validationSchema} from "#lib/spec/schema.ts";

export const TYPE_STRUCT = Symbol('struct');
export const TYPE_STRUCT_INSTANCE = Symbol('struct_instance');
export const STRUCT_NAME_FIELD = Symbol('struct');

const assignStructNameToObj = (structNameUnique) => (obj) =>
    Object.assign({
        [TYPE_NAME_FIELD]: TYPE_STRUCT_INSTANCE,
        [STRUCT_NAME_FIELD]: structNameUnique,
    }, obj);

export const BStruct = (validation) => (structName = '', schema: {},) => {
    const structNameUnique = generateStructNameUnique(structName)

    const instanceBuilder: IStructBuilder = pipe(
        assignStructNameToObj(structNameUnique),
        readonly,
        validation(schema),
        (result) => {
            throwIfFailValidation(result, structName);

            return result.val;
        }
    );
    instanceBuilder[TYPE_NAME_FIELD] = TYPE_STRUCT;
    instanceBuilder[STRUCT_NAME_FIELD] = structNameUnique;

    return instanceBuilder;
}
export const Struct = BStruct(validationSchema);

export const BUnsafeStruct = (validation) => (structName = '', schema: {},) => {
    const structNameUnique = generateStructNameUnique(structName)

    const instanceBuilder: IUnsafeStructBuilder = pipe(
        assignStructNameToObj(structNameUnique),
        readonly,
        validation(schema),
    );

    instanceBuilder[TYPE_NAME_FIELD] = TYPE_STRUCT;
    instanceBuilder[STRUCT_NAME_FIELD] = structNameUnique;

    return instanceBuilder;
}

export const UnsafeStruct = BUnsafeStruct(validationSchema);

const generateStructNameUnique = (structName = "") => {
    failIf(! isString(structName) || isEmpty(structName), `Struct name is required then declare the structure`);
    return Symbol(structName);
}

const throwIfFailValidation = (validationResult, structName) => {
    if (! validationResult.isOk && validationResult.panic) {
        throw new StructValidationException(structName, validationResult);
    }
}

/**
 * Declare types
 */

type IStructBuilder = <S extends Record<string, any>>(obj: S) => Readonly<S>
type IUnsafeStructBuilder = <S extends Record<string, any>>(obj: S) => IResult<Readonly<S>, any>

type CheckResult = true | string;


class StructValidationException extends Error {
    #errDetails = {};
    #structName = "";

    constructor(structName, err) {
        super(`Struct '${structName}' : ` +  JSON.stringify(err));
        this.#errDetails = err;
        this.#structName = structName;
    }

    get errDetails() {
        return this.#errDetails;
    }
}
