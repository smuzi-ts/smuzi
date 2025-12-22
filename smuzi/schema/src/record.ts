import {asMap, asRecord, dump, Err, None, Ok, Result, Simplify, StdMap, StdRecord} from "@smuzi/std";
import { SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaObject} from "#lib/obj.js";
import {SchemaRequired} from "#lib/required.js";

export type SchemaRecordConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
type InferSchema<C extends SchemaRecordConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaRecordConfig> = { [K in keyof C]: C[K]['__inferError'] }
type SchemaRecordValidationError<C extends SchemaRecordConfig> = SchemaValidationError<StdRecord<Simplify<InferValidationSchema<C>>>>;
export class SchemaRecord<C extends SchemaRecordConfig> implements SchemaRule {
    #config: C;
    __infer: StdRecord<Simplify<InferSchema<C>>> | undefined
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
                    if (self.#config[key] instanceof SchemaRequired) {
                        hasErrors = true;
                        errors.set(key, self.#config[key].getErr());
                    }
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdRecord() as NonNullable<typeof this.__infer>;

        for (const field in this.#config) {
            output.set(field, this.#config[field].fake());
        }

        return output;
    }
}
