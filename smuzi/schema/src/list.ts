import {asList, Err, Ok, Result, Simplify, StdList, StdMap, StdRecord} from "@smuzi/std";
import {SchemaObject} from "#lib/obj.js";
import {SchemaConfig, SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord} from "#lib/record.js";

export type SchemaConfigList<C extends SchemaConfig = SchemaConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

type InferListSchema<C extends SchemaConfigList> = StdList<C['__infer']>;

type InferValidationSchemaList<C extends SchemaConfigList> = C['__inferError'];

export class SchemaList<C extends SchemaConfigList> implements SchemaRule {
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

        for (const [key, val] of input) {
            val.match({
                Some(value) {
                    self.#config.validate(value).errThen(err => {
                        hasErrors = true;
                        errors.set(key, err);
                    })
                },
                None() {
                    hasErrors = true;
                    errors.set(key, {msg: "required", data: new StdRecord()});
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdList() as typeof this.__infer;

        for (let i = 0; i < 5; i++) {
            output.push(this.#config.fake());
        }

        return output;
    }
}
