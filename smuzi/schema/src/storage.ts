import {SchemaRule, SchemaValidationError} from "#lib/types.js";
import {Err, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";

export class SchemaStorageAutoNumber implements SchemaRule {
    #msg: string;
    __infer: number;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return  typeof input === "number" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});

    }

    fake() {
        return faker.number();
    }
}

export const storage = {
    autoNumber: (msg: string = "Expected number") => new SchemaStorageAutoNumber(msg),
}