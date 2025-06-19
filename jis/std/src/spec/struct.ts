import {type IResult, Result} from "#lib/dataTypes/result.ts";
import {Exception, readonly} from "#lib/prelude.js";
import {isEmpty, isString, pipe, pipeIn} from "#lib/utils.js";
import {TYPE_NAME_FIELD, validationSchema} from "#lib/spec/schema.ts";

export const STRICT_MODE_ENABLE = true;
export const STRICT_MODE_DISABLE = false;

export const TYPE_STRUCT = Symbol('TYPE_STRUCT');
export const TYPE_STRUCT_INSTANCE = Symbol('TYPE_STRUCT_INSTANCE');
export const STRUCT_NAME_FIELD = Symbol('STRUCT_NAME_FIELD');

const assignStructNameToObj = (structNameUnique) => (obj) =>
    Object.assign({
        [TYPE_NAME_FIELD]: TYPE_STRUCT_INSTANCE,
        [STRUCT_NAME_FIELD]: structNameUnique,
    }, obj);

export const BStruct = (validation, strictModeStruct) => (structName = '', schema: {}) => {
    const structNameUnique = generateStructNameUnique(structName)

    const instanceBuilder = (obj, strictMode = strictModeStruct) => pipeIn(obj)
    (
        assignStructNameToObj(structNameUnique),
        readonly,
        validation(schema),
        (result) => {
            if(! result.isOk() && strictMode) throw new StructValidationException(structName, result.val);

            return strictMode === STRICT_MODE_DISABLE ? result : result.val;
        }
    );

    instanceBuilder[TYPE_NAME_FIELD] = TYPE_STRUCT;
    instanceBuilder[STRUCT_NAME_FIELD] = structNameUnique;

    return instanceBuilder;
}


export const Struct: IStructBuilder = BStruct(validationSchema, STRICT_MODE_ENABLE);
export const UnstrictStruct: IUnstrictStructBuilder = BStruct(validationSchema, STRICT_MODE_DISABLE);

const generateStructNameUnique = (structName = "") => {
    if(! isString(structName) || isEmpty(structName)) throw new Exception(`Struct name is required then declare the structure`);
    return Symbol(structName);
}

/**
 * Declare types
 */

type IStructBuilder = (structName: string, schema: {}) => <S extends Record<string, any>>(obj: S) => Readonly<S>
type IUnstrictStructBuilder = (structName: string, schema: {}) => <S extends Record<string, any>>(obj: S) => IResult<Readonly<S>, any>

type CheckResult = true | string;


export class StructValidationException extends Exception {
    constructor(structName, err) {
        super(`Struct '${structName}' : ` +  JSON.stringify(err), {structName, err});
    }
}
