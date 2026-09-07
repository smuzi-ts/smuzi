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
import {SchemaRule, SchemaValidationError} from "./types.js";


export class SchemaNumber implements SchemaRule {
    #msg: string;
    __infer: number;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<number, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return  asNumber(input) ? Ok(input) : Err({msg: this.#msg, data: new StdRecord()});

    }

    fake() {
        return faker.number();
    }
}

export class SchemaString implements SchemaRule {
    #msg: string;
    __infer: string;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<string, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return  asString(input) ? Ok(input) : Err({msg: this.#msg, data: new StdRecord()});
    }

    fake() {
        return faker.string();
    }
}

export class SchemaBoolean implements SchemaRule {
    #msg: string;
    __infer: boolean;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<boolean, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return  asBool(input) ? Ok(input) : Err({msg: this.#msg, data: new StdRecord()});
    }

    fake() {
        return faker.boolean();
    }
}
