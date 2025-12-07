import {assert, describe, it} from "@smuzi/tests";
import {Err, Ok, Result} from "#lib/result.js";
import {faker} from "@smuzi/faker";
import {asObject, isNull} from "#lib/checker.js";
import {StdRecord} from "#lib/record.js";
import {Some} from "#lib/option.js";

interface SchemaRule {
    validate(input: unknown): Result<true>
}

type PropertyValidationError = { key: string, msg: string };
type RecordValidationError<T extends Record<PropertyKey, PropertyValidationError> = Record<PropertyKey, PropertyValidationError>> =
    string
    | StdRecord<T>;

type SchemaConfig = Record<PropertyKey, SchemaRule>;

class SchemaRecord<C extends SchemaConfig = SchemaConfig> {
    #config: C;

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, RecordValidationError> {
        if (!asObject(input)) {
            return Err("Expected input as object");
        }

        const errors = new StdRecord();
        let hasErrors = false;

        for (const key in this.#config) {
            if (isNull(input[key])) {
                return Err(`${key} must be NOT null`);
            }
            this.#config[key].validate(input[key]).errThen(err => {
                hasErrors = true;
                errors.set(key, err);
            })
        }

        return hasErrors ? Err(errors as any) : Ok(true);
    }
}

class SchemaNumber {
    __type: number
    validate(input: unknown): Result<true, string> {
        return typeof input === "number" ? Ok(true) : Err("Excepted Number");
    }
}

class SchemaString {
    __type: string
    validate(input: unknown): Result<true, string> {
        return typeof input === "string" ? Ok(true) : Err("Excepted String");
    }
}

export const schema = {
    record: (config: SchemaConfig) => new SchemaRecord(config),
    number: () => new SchemaNumber,
    string: () => new SchemaString,
}

export default describe("Std-Schema", [
        it("Number-Ok", () => {
            const schemaVal = schema.number();
            assert.result.equalOk(schemaVal.validate(faker.number()))
        }),
        it("Number-Err", () => {
            const schemaVal = schema.number();
            const validation = schemaVal.validate(faker.string());
            assert.result.equalErr(validation, Some("Excepted Number"));
        }),
        it("String-Ok", () => {
            const schemaVal = schema.string();
            assert.result.equalOk(schemaVal.validate(faker.string()))
        }),
        it("String-Err", () => {
            const schemaVal = schema.string();
            const validation = schemaVal.validate(faker.number());
            assert.result.equalErr(validation, Some("Excepted String"));
        }),
        it("Object-Ok", () => {
            const schemaRecord = schema.record({
                id: schema.number(),
                name: schema.string()
            });

            assert.result.equalOk(schemaRecord.validate({
                id: faker.number(),
                name: faker.string()
            }))
        }),
    ]
)