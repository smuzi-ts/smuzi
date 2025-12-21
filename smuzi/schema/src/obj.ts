import {asObject, Err, isNull, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {SchemaConfig, SchemaRule, SchemaValidationError} from "#lib/types.js";
type InferSchemaObj<C extends SchemaConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaConfig> = { [K in keyof C]: C[K]['__inferError'] }

export class SchemaObject<C extends SchemaConfig = SchemaConfig> implements SchemaRule {
    #config: C;
    __infer: Simplify<InferSchemaObj<C>>
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
            if (isNull(input[key])) {
                hasErrors = true;
                errors.set(key, {msg: "required", data: new StdRecord});
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
        let output = {} as typeof this.__infer;

        for (const field in this.#config) {
            output[field] = this.#config[field].fake()
        }

        return output;
    }
}
