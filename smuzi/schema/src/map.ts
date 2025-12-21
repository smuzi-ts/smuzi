import { asMap, Err, Ok, Result, Simplify, StdMap, StdRecord} from "@smuzi/std";
import {SchemaObject} from "#lib/obj.js";
import {SchemaConfig, SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaRecord} from "#lib/record.js";

type SchemaConfigMap<C extends SchemaConfig = SchemaConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;
type InferMapSchema<K extends SchemaRule, C extends SchemaConfigMap> = StdMap<K['__infer'], C['__infer']>;
type InferValidationSchemaMap<C extends SchemaConfigMap> = C['__inferError'];

export class SchemaMap<K extends SchemaRule, C extends SchemaConfigMap, K_infer = K["__infer"]> implements SchemaRule {
    #config: C;
    #key: K;
    __infer: Simplify<InferMapSchema<K, C>>
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(key: K, config: C) {
        this.#key = key;
        this.#config = config;
    }

    getConfig(): C {
        return this.#config;
    }

    getKey(): K {
        return this.#key;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<unknown, InferValidationSchemaMap<C>>();

        if (! asMap(input)) {
            return Err({msg: "Expected input as StdMap", data: errors});
        }

        let hasErrors = false;

        const self = this;

        for (const [key, val] of input) {
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
                            hasErrors = true;
                            errors.set(key, {msg: "required", data: new StdRecord()});
                        }
                    })
                }
            })


        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdMap() as typeof this.__infer;

        for (let i = 0; i < 5; i++) {
            output.set(i, this.#config.fake());
        }

        return output;
    }

}
