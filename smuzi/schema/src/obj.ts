import {asObject, dump, Err, isNone, isNull, Ok, Option, Result, Simplify, StdRecord} from "@smuzi/std";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord} from "#lib/record.js";
import {SchemaOption} from "#lib/option.js";

export type SchemaObjConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;

type InferSchemaObj<C extends SchemaObjConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaObjConfig> = { [K in keyof C]: C[K]['__inferError'] }

export class SchemaObject<C extends SchemaObjConfig = SchemaObjConfig> implements SchemaRule {
    #config: C;
    __infer: Simplify<InferSchemaObj<C>>;
    __inferError: SchemaValidationError<StdRecord<InferValidationSchema<C>>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<InferValidationSchema<C>>>> {
        if (!asObject(input)) {
            return Err({msg: "Expected input as object", data: new StdRecord});
        }

        const errors = new StdRecord<InferValidationSchema<C>>();
        let hasErrors = false;

        for (const key in this.#config) {
            if ((isNull(input[key]) || isNone(input[key])) && ! (this.#config[key] instanceof SchemaOption)) {
                hasErrors = true;
                errors.set(key,  {msg: "Required", data: new StdRecord() });
                continue;
            }

            this.#config[key].validate(input[key]).errThen(err => {
                hasErrors = true;
                errors.set(key, err);
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = {} as any;

        for (const field in this.#config) {
            output[field] = this.#config[field].fake()
        }

        return output;
    }
}
