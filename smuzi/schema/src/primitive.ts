import {dump, Err, isNone, isNull, Ok, Option, OptionFromNullable, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";


export class SchemaNumber implements SchemaRule {
    #msg: string;
    __infer: Option<number>;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return OptionFromNullable(input).match({
            Some: (v)=>  typeof v === "number" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()}),
            None: () => Ok(true)
        })
    }

    fake() {
        return faker.number();
    }
}

export class SchemaString implements SchemaRule {
    #msg: string;
    __infer: Option<string>;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return OptionFromNullable(input).match({
            Some: (v)=>  typeof v === "string" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()}),
            None: () => Ok(true)
        })
    }

    fake() {
        return faker.string();
    }
}
