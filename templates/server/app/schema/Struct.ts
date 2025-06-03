export const Struct =
    (schema: {}, validation = validationSchema) =>
        <S extends Record<string, any>>(obj: S): [ValidationErrors|undefined, Readonly<S>] =>
        {
            return [validation(schema, obj), Object.freeze(obj)];
        };


export const validationSchema = (schema: Schema, data: Record<string, any>) => {
    const err: ValidationErrors = {};
    let isValid = true;

    for (const varName in schema) {
        const handler = schema[varName];
        const check = handler.check(varName, data[varName]);
        if (check !== true) {
            isValid = false;
            err[varName] = check;
        }
    }

    return isValid ? undefined : err;
};


/**
 * Declare additional types
 */

type CheckResult = true | string;

type SchemaItem = {
    check: (key: string, value?: any) => CheckResult;
};

type Schema = Record<string, SchemaItem>;

type ValidationErrors = Record<string, string>;
