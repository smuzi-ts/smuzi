import {
    SchemaRule, SchemaValidationError
} from "#lib/index.js";
import {Err, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";

type SchemaStorageAutonumberConfig = { msg: string };
type InputSchemaStorageAutonumberConfig = { msg?: string };

export class SchemaStorageAutonumber<C extends SchemaStorageAutonumberConfig> implements SchemaRule {
    #config: C;
    __infer: number;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return input instanceof Date ? Ok(true) : Err({msg: this.#config.msg, data: new StdRecord()});
    }

    fake() {
        return faker.number();
    }
}

export const storage = {
    autoNumber: ({msg = "Expected Autonumber"}: InputSchemaStorageAutonumberConfig = {}) => (new SchemaStorageAutonumber({msg})),
}