import {
    asBool,
    asNumber,
    asString,
    dump,
    Err,
    isNone,
    isNull,
    Ok,
    Option,
    OptionFromNullable,
    Result,
    Simplify,
    StdRecord
} from "@smuzi/std";
import {faker} from "@smuzi/faker";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";

export type SchemaEnumStringsConfig = string[];

export class SchemaEnumStrings<const C extends readonly string[]> implements SchemaRule {
    #config: C;
    __infer: C[number]
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<typeof this.__infer, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return  asString(input) && this.#config.includes(input) ? Ok(input) : Err({msg: "Invalid variant of enum strings", data: new StdRecord()});
    }

    fake() {
        return faker.array.getItem(this.#config as unknown as string[]);
    }
}


export const _enum = {
    string: <C extends SchemaEnumStringsConfig>(config: C) => new SchemaEnumStrings<C>(config),
}
