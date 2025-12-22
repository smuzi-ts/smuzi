import {dump, Err, isNull, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";
import {SchemaRule, SchemaValidationError} from "#lib/types.js";


export class SchemaNumber implements SchemaRule {
    #msg: string;
    readonly __infer: number;
    readonly __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        if (isNull(input)) {
            return Ok(true);
        }
        return typeof input === "number" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
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

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        if (isNull(input)) {
            return Ok(true);
        }
        return typeof input === "string" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
    }

    fake() {
        return faker.string();
    }
}
