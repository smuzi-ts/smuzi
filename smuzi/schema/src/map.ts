import {asMap, dump, Err, None, Ok, Option, Result, Simplify, StdMap, StdRecord} from "@smuzi/std";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaOption} from "#lib/option.js";
import { error } from "console";

export type SchemaMapConfig = SchemaRule;
type InferMapSchema<K extends SchemaRule, C extends SchemaMapConfig> = StdMap<K['__infer'], C['__infer']>;
type InferValidationSchemaMap<C extends SchemaMapConfig> = C['__inferError'];

export class SchemaMap<K extends SchemaRule, C extends SchemaMapConfig> implements SchemaRule {
    #config: C;
    #key: K;
    __infer: Simplify<InferMapSchema<K, C>>;
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(key: K, config: C) {
        this.#key = key;
        this.#config = config;
    }

    validate<I = unknown>(input: I): Result<Map<K['__infer'], C['__infer']>, Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<unknown, InferValidationSchemaMap<C>>();

        if (! asMap(input)) {
            return Err({msg: "Expected input as StdMap", data: errors});
        }

        let hasErrors = false;

        const self = this;

        const res = new Map;

        for (const [key, val] of input as unknown as StdMap) {
            self.#key.validate(key).match({
                Err(errKey) {
                    hasErrors = true;
                    errors.set(key, {msg: "Invalid key: " + errKey.msg, data: errKey.data });
                }, Ok(validKey) {
                    val.match({
                        Some(value) {
                            self.#config.validate(value).match({
                                Err: err => {
                                    hasErrors = true;
                                    errors.set(key, err);
                                },
                                Ok: validValue => {
                                    res.set(validKey, validValue)
                            }
                            })

                        },
                        None() {
                            if (! (self.#config instanceof SchemaOption)) {
                                hasErrors = true;
                                errors.set(key,  {msg: "Required", data: new StdRecord() });
                            }
                            res.set(validKey, None())
                        }
                    })
                }
            })

        }

        return hasErrors ? Err({msg: "invalid schema map", data: errors}) : Ok(res);
    }

    fake() {
        let output = new StdMap() as any;

        for (let i = 1; i <= 2; i++) {
            output.set(this.#key.fake(), this.#config.fake());
        }

        return output;
    }

}
