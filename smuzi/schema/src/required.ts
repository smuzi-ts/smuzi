import {SchemaRecord, SchemaRecordConfig} from "#lib/record.js";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaObject} from "#lib/obj.js";
import {dump, Err, isNone, isNull, None, Ok, Result, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";

export type SchemaRequiredConfig<C extends SchemaRecordConfig = SchemaRecordConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

export class SchemaRequired<C extends SchemaRequiredConfig> implements SchemaRule {
    #msg: string
    #config: C;
    __infer: C['__infer']
    __inferError: C['__inferError']

    constructor(config: C, msg: string) {
        this.#config = config;
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError<C['__inferError']>> {
        if (isNull(input) || isNone(input)) {
            return Err(this.getErr());
        }

        return this.#config.validate(input);
    }

    fake() {
        return this.#config.fake();
    }

    getErr() {
        return {msg: this.#msg, data: new StdRecord};
    }
}
