import {Err, Ok, Result} from "#lib/result.js";
import {asObject, asRecord, isNull} from "#lib/checker.js";
import {StdRecord} from "#lib/record.js";
import {Simplify} from "#lib/utilTypes.js";

export interface SchemaRule {
    __infer: unknown;
    validate(input: unknown): Result<true, SchemaValidationError>
}

type SchemaConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
type SchemaListConfig = SchemaRule | SchemaObject | SchemaRecord<any>;

type InferSchema<C extends SchemaConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferListSchema<C extends SchemaListConfig> = (C['__infer'])[];

type InferValidationSchema<C extends SchemaConfig> = {
    [K in keyof C]: SchemaValidationError;
};

export type SchemaValidationError<T extends Record<PropertyKey, SchemaValidationError> = Record<PropertyKey, any>> = {
    msg: string;
    data: StdRecord<T>;
}

class SchemaObject<C extends SchemaConfig = SchemaConfig> {
    #config: C;
    __infer: Simplify<InferSchema<C>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<InferValidationSchema<C>>> {
        if (!asObject(input)) {
            return Err({msg:"Expected input as object", data: new StdRecord});
        }

        const errors = new StdRecord<InferValidationSchema<C>>();
        let hasErrors = false;

        for (const key in this.#config) {
            if (isNull(input[key])) {
                hasErrors = true;
                errors.set(key, {msg: "required", data: new StdRecord});
                continue;
            }

            this.#config[key].validate(input[key]).errThen(err => {
                hasErrors = true;
                errors.set(key, err);
            })
        }

        return hasErrors ? Err({msg:"invalid", data: errors}) : Ok(true);
    }
}

export class SchemaRecord<C extends SchemaConfig> {
    #config: C;
    __infer: StdRecord<InferSchema<C>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<Simplify<InferValidationSchema<C>>>> {
        if (! asRecord(input)) {
            return Err({msg:"Expected input as StdRecord", data: new StdRecord()});
        }

        const errors = new StdRecord<InferValidationSchema<C>>();
        let hasErrors = false;

        const self = this;
        for (const key in this.#config) {
            input.get(key).match({
                Some(value) {
                    self.#config[key].validate(value).errThen(err => {
                        hasErrors = true;
                        errors.set(key, err);
                    })
                },
                None() {
                    hasErrors = true;
                    errors.set(key, {msg: "required", data: new StdRecord()});
                }})

        }

        return hasErrors ? Err({msg:"invalid", data: errors}) : Ok(true);
    }
}


export class SchemaList<C extends SchemaListConfig> {
    #config: C;
    __infer: InferListSchema<C>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<Simplify<InferValidationSchema<C>>>> {
        if (! asRecord(input)) {
            return Err({msg:"Expected input as StdRecord", data: new StdRecord()});
        }

        const errors = new StdRecord<InferValidationSchema<C>>();
        let hasErrors = false;

        const self = this;
        for (const key in this.#config) {
            input.get(key).match({
                Some(value) {
                    self.#config[key].validate(value).errThen(err => {
                        hasErrors = true;
                        errors.set(key, err);
                    })
                },
                None() {
                    hasErrors = true;
                    errors.set(key, {msg: "required", data: new StdRecord()});
                }})

        }

        return hasErrors ? Err({msg:"invalid", data: errors}) : Ok(true);
    }
}

class SchemaNumber implements SchemaRule {
    #msg: string;
    __infer: number;

    constructor(msg: string) {
        this.#msg = msg;
    }

    validate(input: unknown): Result<true, SchemaValidationError> {
        return typeof input === "number" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
    }
}


class SchemaString implements SchemaRule {
    #msg: string;
    __infer: string;
    constructor(msg: string) {
        this.#msg = msg;
    }
    validate(input: unknown): Result<true, SchemaValidationError> {
        return typeof input === "string" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
    }
}

export const schema = {
    number: (msg = "Expected number") => (new SchemaNumber(msg)),
    string: (msg = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaConfig>(config: C) => new SchemaRecord<C>(config),
    list: <C extends SchemaListConfig>(config: C) => (new SchemaList<C>(config)),
}