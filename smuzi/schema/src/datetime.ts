import {
 SchemaRule, SchemaValidationError
} from "#lib/index.js";
import {Err, Ok, Result, Simplify, StdRecord} from "@smuzi/std";

type SchemaNativeDateConfig = { msg: string };
type InputSchemaNativeDateConfig = { msg?: string };

export class SchemaNativeDate<C extends SchemaNativeDateConfig> implements SchemaRule {
    #config: C;
    __infer: Date;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return input instanceof Date ? Ok(true) : Err({msg: this.#config.msg, data: new StdRecord()});
    }

    getConfig(): C {
        return this.#config;
    }
}

export const datetime = {
    native: ({msg = "Expected instance of Date"}: InputSchemaNativeDateConfig = {}) => (new SchemaNativeDate({msg})),
}