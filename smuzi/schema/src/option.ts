import {SchemaRecord, SchemaRecordConfig} from "#lib/record.js";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {SchemaObject} from "#lib/obj.js";
import {
    asNull,
    dump,
    Err,
    isNone,
    isNull, isOption,
    None,
    Ok,
    Option,
    OptionFromNullable,
    Result,
    Some,
    StdRecord
} from "@smuzi/std";

export type SchemaOptionConfig<C extends SchemaRecordConfig = SchemaRecordConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

export class SchemaOption<C extends SchemaOptionConfig> implements SchemaRule {
    #config: C;
    __infer: Option<C['__infer']>;
    __inferError: C['__inferError']

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, C['__inferError']> {
        if (isOption(input)) {
            return input.match({
                None: () => Ok(true),
                Some: (v) => this.#config.validate(v)
            })
        }

        return isNull(input) ? Ok(true) : this.#config.validate(input);
    }

    fake() {
        return OptionFromNullable(this.#config.fake());
    }
}
