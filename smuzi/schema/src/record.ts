import {asMap, asRecord, Err, Ok, Result, Simplify, StdMap, StdRecord} from "@smuzi/std";
import {SchemaConfig, SchemaRule, SchemaValidationError} from "#lib/types.js";

type InferSchema<C extends SchemaConfig> = {
    [K in keyof C]: C[K]['__infer'];
};
type InferValidationSchema<C extends SchemaConfig> = { [K in keyof C]: C[K]['__inferError'] }
type SchemaRecordValidationError<C extends SchemaConfig> = SchemaValidationError<StdRecord<Simplify<InferValidationSchema<C>>>>;
export class SchemaRecord<C extends SchemaConfig> implements SchemaRule {
    #config: C;
    __infer: StdRecord<Simplify<InferSchema<C>>>
    __inferError: Simplify<SchemaRecordValidationError<C>>

    constructor(config: C) {
        this.#config = config;
    }

    getConfig(): C {
        return this.#config;
    }

    validate(input: unknown): Result<true, SchemaRecordValidationError<C>> {
        const errors = new StdRecord<InferValidationSchema<C>>();

        if (!asRecord(input)) {
            return Err({msg: "Expected input as StdRecord", data: errors});
        }

        let hasErrors = false;

        const self = this;
        for (const key in this.#config) {
            input.get(key).match({
                Some(value) {
                    self.#config[key].validate(value).errThen(err => {
                        hasErrors = true;
                        errors.set(key, err);
                    })
                },
                None() {
                    hasErrors = true;
                    errors.set(key, {msg: "required", data: errors});
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdRecord() as typeof this.__infer;

        for (const field in this.#config) {
            output.set(field, this.#config[field].fake());
        }

        return output;
    }
}
