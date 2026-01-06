import {
    asMap,
    asRecord,
    dump,
    Err,
    None,
    Ok,
    Option,
    OptionFromNullable,
    Result,
    Simplify,
    StdMap,
    StdRecord
} from "@smuzi/std";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaObject} from "#lib/obj.js";
import {SchemaOption} from "#lib/option.js";

export type SchemaRecordConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
type InferSchema<C extends SchemaRecordConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaRecordConfig> = { [K in keyof C]: C[K]['__inferError'] }
type SchemaRecordValidationError<C extends SchemaRecordConfig> = SchemaValidationError<StdRecord<Simplify<InferValidationSchema<C>>>>;

export class SchemaRecord<C extends SchemaRecordConfig> implements SchemaRule {
    #config: C;
    __infer: StdRecord<Simplify<InferSchema<C>>>
    __inferError: Simplify<SchemaRecordValidationError<C>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<Simplify<InferSchema<C>>, SchemaRecordValidationError<C>> {
        const errors = new StdRecord<InferValidationSchema<C>>();

        if (!asRecord(input)) {
            return Err({msg: "Expected input as StdRecord", data: errors});
        }

        let hasErrors = false;

        const self = this;
        const res: any = {};

        for (const key in this.#config) {
            input.get(key).match({
                Some(value) {
                    self.#config[key].validate(value).match({
                        Err: err => {
                            hasErrors = true;
                            errors.set(key, err);
                        },
                        Ok: validValue => {
                            res[key] = validValue;
                        }
                    })
                },
                None() {
                    if (! (self.#config[key] instanceof SchemaOption)) {
                        hasErrors = true;
                        errors.set(key, {msg: "Required", data: new StdRecord()});
                    }
                    res[key] = None();
                }
            })
        }

        return hasErrors ? Err({msg: "Invalid", data: errors}) : Ok(res);
    }

    fake() {
        let output = new StdRecord() as any;

        for (const field in this.#config) {
            output.set(field, this.#config[field].fake());
        }

        return output;
    }
}
