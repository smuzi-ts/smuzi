import {asMap, Err, Ok, Option, Result, Simplify, StdMap, StdRecord} from "@smuzi/std";
import {SchemaObject} from "#lib/obj.js";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord, SchemaRecordConfig} from "#lib/record.js";
import {SchemaRequired} from "#lib/required.js";

export type SchemaMapConfig = SchemaRule;
type InferMapSchema<K extends SchemaRule, C extends SchemaMapConfig> = StdMap<K['__infer'], C['__infer']>;
type InferValidationSchemaMap<C extends SchemaMapConfig> = C['__inferError'];

export class SchemaMap<K extends SchemaRule, C extends SchemaMapConfig> implements SchemaRule {
    #config: C;
    #key: K;
    __infer: Option<Simplify<InferMapSchema<K, C>>>;
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(key: K, config: C) {
        this.#key = key;
        this.#config = config;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<unknown, InferValidationSchemaMap<C>>();

        if (! asMap(input)) {
            return Err({msg: "Expected input as StdMap", data: errors});
        }

        let hasErrors = false;

        const self = this;

        for (const [key, val] of input as StdMap) {
            self.#key.validate(key).match({
                Err(errKey) {
                    hasErrors = true;
                    errors.set(key, {msg: "Invalid key: " + errKey.msg, data: errKey.data });
                }, Ok() {
                    val.match({
                        Some(value) {
                            self.#config.validate(value).errThen(err => {
                                hasErrors = true;
                                errors.set(key, err);
                            })
                        },
                        None() {
                            if (self.#config instanceof SchemaRequired) {
                                hasErrors = true;
                                errors.set(key, self.#config.getErr());
                            }
                        }
                    })
                }
            })

        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdMap() as any;

        for (let i = 1; i <= 2; i++) {
            output.set(this.#key.fake(), this.#config.fake());
        }

        return output;
    }

}
