import {Err, Ok, Result} from "#lib/result.js";
import {asMap, asObject, asRecord, isNull} from "#lib/checker.js";
import {StdRecord} from "#lib/record.js";
import {Simplify} from "#lib/utilTypes.js";
import {StdMap} from "#lib/map.js";
import { dump } from "./debug.js";


export interface SchemaRule {
    __infer: unknown;
    __inferError: unknown;
    validate(input: unknown): Result<true, SchemaValidationError<unknown>>
}

type SchemaConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
type SchemaConfigMap<C extends SchemaConfig = SchemaConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

type InferSchema<C extends SchemaConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaConfig> = {[K in keyof C]: C[K]['__inferError']}

type InferMapSchema<C extends SchemaConfigMap> = (C['__infer'])[];

type InferValidationSchemaMap<C extends SchemaConfigMap> = C['__inferError'];

export type SchemaValidationError<D> = {
    msg: string;
    data: D;
}

class SchemaObject<C extends SchemaConfig = SchemaConfig> {
    #config: C;
    __infer: Simplify<InferSchema<C>>
    __inferError: SchemaValidationError<StdRecord<InferValidationSchema<C>>>
    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<InferValidationSchema<C>>>> {
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


type SchemaRecordValidationError<C extends  SchemaConfig> = SchemaValidationError<StdRecord<Simplify<InferValidationSchema<C>>>>;

export class SchemaRecord<C extends SchemaConfig> {
    #config: C;
    __infer: StdRecord<Simplify<InferSchema<C>>>
    __inferError: Simplify<SchemaRecordValidationError<C>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaRecordValidationError<C>> {
        const errors = new StdRecord<InferValidationSchema<C>>();

        if (! asRecord(input)) {
            return Err({msg:"Expected input as StdRecord", data: errors});
        }

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
                    errors.set(key, {msg: "required", data: errors});
                }})
        }

        return hasErrors ? Err({msg:"invalid", data: errors}) : Ok(true);
    }
}


export class SchemaMap<C extends SchemaConfigMap> {
    #config: C;
    __infer: Simplify<InferMapSchema<C>>
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(config: C) {
        this.#config = config;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<unknown, InferValidationSchemaMap<C>>();

        if (! asMap(input)) {
            return Err({msg:"Expected input as StdMap", data: errors});
        }

        let hasErrors = false;

        const self = this;

        for (const [key, val] of input) {
            val.match({
                Some(value) {
                    self.#config.validate(value).errThen(err => {
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
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }


    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return typeof input === "number" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
    }
}


class SchemaString implements SchemaRule {
    #msg: string;
    __infer: string;
    __inferError: Simplify<SchemaValidationError<StdRecord<{}>>>;

    constructor(msg: string) {
        this.#msg = msg;
    }
    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<Record<PropertyKey, unknown>>>> {
        return typeof input === "string" ? Ok(true) : Err({msg: this.#msg, data: new StdRecord()});
    }
}

export const schema = {
    number: (msg = "Expected number") => (new SchemaNumber(msg)),
    string: (msg = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaConfig>(config: C) => new SchemaRecord<C>(config),
    map: <C extends SchemaConfigMap>(config: C) => (new SchemaMap<C>(config)),
}