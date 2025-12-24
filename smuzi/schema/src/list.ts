import {asList, Err, Ok, Option, Result, Simplify, StdList, StdMap, StdRecord} from "@smuzi/std";
import {SchemaObject} from "#lib/obj.js";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord, SchemaRecordConfig} from "#lib/record.js";
import {SchemaOption} from "#lib/option.js";

export type SchemaListConfig<C extends SchemaRecordConfig = SchemaRecordConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

type InferListSchema<C extends SchemaListConfig> = StdList<C['__infer']>;

type InferValidationSchemaList<C extends SchemaListConfig> = C['__inferError'];

export class SchemaList<C extends SchemaListConfig> implements SchemaRule {
    #config: C;
    __infer: Simplify<InferListSchema<C>>
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaList<C>>>>>

    constructor(config: C) {
        this.#config = config;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<number, Simplify<InferValidationSchemaList<C>>>>>> {
        const errors = new StdMap<number, InferValidationSchemaList<C>>();

        if (! asList(input)) {
            return Err({msg: "Expected input as StdList", data: errors});
        }

        let hasErrors = false;

        const self = this;

        for (const [key, val] of input as StdList) {
            val.match({
                Some(value) {
                    self.#config.validate(value).errThen(err => {
                        hasErrors = true;
                        errors.set(key, err);
                    })
                },
                None() {
                    if (! (self.#config[key] instanceof SchemaOption)) {
                        hasErrors = true;
                        errors.set(key, {msg: "Required", data: new StdRecord()});
                    }
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdList() as any;

        for (let i = 0; i < 5; i++) {
            output.push(this.#config.fake());
        }

        return output;
    }
}
