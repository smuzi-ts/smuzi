const Result = {
    Ok: (data: any) => ({
        isOk: true,
        value: data,
    }),
    Err: (error: any) => ({
        isOk: false,
        value: error,
    })
};


export const Struct =
    (schema: {}, {validation = validationSchema, strictMode = true} = {}) =>
        <S extends Record<string, any>>(obj: S): [ValidationErrors|null, Readonly<S>] =>
        {
            const err = validation(schema, obj);
            if (err !== null && strictMode) {
                throw new ValidationException(err);
            }

            return [err, Object.freeze(obj)];
        };


export const validationSchema = (schema: Schema, data: Record<string, any>) => {
    const err: ValidationErrors = {};
    let isValid = true;

    for (const varName in schema) {
        const handler = schema[varName];
        const check = handler.check(data[varName]);
        if (check !== true) {
            isValid = false;
            err[varName] = check;
        }
    }

    return isValid ? null : err;
};

/**
 * Declare types
 */

type CheckResult = true | string;

type SchemaItem = {
    check: (key: string, value?: any) => CheckResult;
};

type Schema = Record<string, SchemaItem>;

type ValidationErrors = Record<string, string>;

class ValidationException extends Error {
    #err = {};

    constructor(err: ValidationErrors) {
        super(JSON.stringify(err));
        this.#err = err;
    }

    get err() {
        return this.#err;
    }
}
