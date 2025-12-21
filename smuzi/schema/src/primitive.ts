import { SchemaRule, SchemaValidationError} from "#lib/index.js";
import {Err, Ok, Result, Simplify, StdRecord} from "@smuzi/std";
import {faker} from "@smuzi/faker";

type SchemaNumberConfig = { msg: string };

export class SchemaNumber implements SchemaRule {
    #config: SchemaNumberConfig;
    readonly __infer: number;
    readonly __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#config = {msg};
    }

    getConfig(): SchemaNumberConfig {
        return this.#config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return typeof input === "number" ? Ok(true) : Err({msg: this.#config.msg, data: new StdRecord()});
    }

    fake() {
        return faker.number();
    }
}


type SchemaStringConfig = { msg: string };

export class SchemaString implements SchemaRule {
    #config: SchemaStringConfig;
    __infer: string;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#config = {msg};
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return typeof input === "string" ? Ok(true) : Err({msg: this.#config.msg, data: new StdRecord()});
    }

    fake() {
        return faker.string();
    }
}
