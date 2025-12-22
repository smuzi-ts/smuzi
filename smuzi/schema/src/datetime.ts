import {Err, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";

type SchemaNativeDateConfig = { msg: string };

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

    fake() {
        return faker.datetime.native();
    }
}

export const datetime = {
    native: ({msg = "Expected instance of Date"}: Partial<SchemaNativeDateConfig> = {}) => (new SchemaNativeDate({msg})),
}