import {
    Err,
    Ok,
    Result,
    asMap,
    asObject,
    asRecord,
    isNull,
    StdRecord,
    Simplify,
    StdMap,
    StdList,
    asList, dump
} from "@smuzi/std";
import {datetime} from "#lib/datetime.js";
import {faker} from "@smuzi/faker";
import {storage} from "#lib/storage.js";
export {SchemaNativeDate} from "#lib/datetime.js";

export interface SchemaRule {
    __infer: unknown;
    __inferError: unknown;

    validate(input: unknown): Result<true, SchemaValidationError<unknown>>
    fake(): typeof this.__infer
}

type SchemaConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
type SchemaConfigMap<C extends SchemaConfig = SchemaConfig> = SchemaRule | SchemaObject<C> | SchemaRecord<C>;

type InferSchema<C extends SchemaConfig> = {
    [K in keyof C]: C[K]['__infer'];
};

type InferValidationSchema<C extends SchemaConfig> = { [K in keyof C]: C[K]['__inferError'] }

type InferMapSchema<K extends SchemaRule, C extends SchemaConfigMap> = StdMap<K['__infer'], C['__infer']>;
type InferListSchema<C extends SchemaConfigMap> = StdList<C['__infer']>;

type InferValidationSchemaMap<C extends SchemaConfigMap> = C['__inferError'];

export type SchemaValidationError<D> = {
    msg: string;
    data: D;
}

export class SchemaObject<C extends SchemaConfig = SchemaConfig> implements SchemaRule {
    #config: C;
    __infer: Simplify<InferSchema<C>>
    __inferError: SchemaValidationError<StdRecord<InferValidationSchema<C>>>

    constructor(config: C) {
        this.#config = config;
    }

    validate(input: unknown): Result<true, SchemaValidationError<StdRecord<InferValidationSchema<C>>>> {
        if (!asObject(input)) {
            return Err({msg: "Expected input as object", data: new StdRecord});
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

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = {} as typeof this.__infer;

        for (const field in this.#config) {
            output[field] = this.#config[field].fake()
        }

        return output;
    }
}


type SchemaRecordValidationError<C extends SchemaConfig> = SchemaValidationError<StdRecord<Simplify<InferValidationSchema<C>>>>;

export class SchemaRecord<C extends SchemaConfig> implements SchemaRule {
    #config: C;
    __infer: StdRecord<Simplify<InferSchema<C>>>
    __inferError: Simplify<SchemaRecordValidationError<C>>

    constructor(config: C) {
        this.#config = config;
    }

    getConfig(): C {
        return this.#config;
    }

    validate(input: unknown): Result<true, SchemaRecordValidationError<C>> {
        const errors = new StdRecord<InferValidationSchema<C>>();

        if (!asRecord(input)) {
            return Err({msg: "Expected input as StdRecord", data: errors});
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
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdRecord() as typeof this.__infer;

        for (const field in this.#config) {
            output.set(field, this.#config[field].fake());
        }

        return output;
    }
}


export class SchemaMap<K extends SchemaRule, C extends SchemaConfigMap, K_infer = K["__infer"]> implements SchemaRule {
    #config: C;
    #key: K;
    __infer: Simplify<InferMapSchema<K, C>>
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(key: K, config: C) {
        this.#key = key;
        this.#config = config;
    }

    getConfig(): C {
        return this.#config;
    }

    getKey(): K {
        return this.#key;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<unknown, InferValidationSchemaMap<C>>();

        if (!asMap(input)) {
            return Err({msg: "Expected input as StdMap", data: errors});
        }

        let hasErrors = false;

        const self = this;

        for (const [key, val] of input) {
            self.#key.validate(key).match({
                Err(errKey) {
                    hasErrors = true;
                    errors.set(key, {msg: "Invalid key: " + errKey.msg, data: errKey.data });
                }, Ok() {
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
                        }
                    })
                }
            })


        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

    fake() {
        let output = new StdMap() as typeof this.__infer;

        for (let i = 0; i < 5; i++) {
            output.set(i, this.#config.fake());
        }

        return output;
    }

}

export class SchemaList<C extends SchemaConfigMap> implements SchemaRule {
    #config: C;
    __infer: Simplify<InferListSchema<C>>
    __inferError: Simplify<SchemaValidationError<StdMap<unknown, Simplify<InferValidationSchemaMap<C>>>>>

    constructor(config: C) {
        this.#config = config;
    }

    validate<I = unknown>(input: I): Result<true, Simplify<SchemaValidationError<StdMap<number, Simplify<InferValidationSchemaMap<C>>>>>> {
        const errors = new StdMap<number, InferValidationSchemaMap<C>>();

        if (!asList(input)) {
            return Err({msg: "Expected input as StdList", data: errors});
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
                }
            })
        }

        return hasErrors ? Err({msg: "invalid", data: errors}) : Ok(true);
    }

     fake() {
        let output = new StdList() as typeof this.__infer;

        for (let i = 0; i < 5; i++) {
            output.push(this.#config.fake());
        }

        return output;
    }
}

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



export const schema = {
    number: (msg = "Expected number") => (new SchemaNumber(msg)),
    string: (msg = "Expected string") => (new SchemaString(msg)),
    obj: <C extends SchemaConfig>(config: C) => new SchemaObject<C>(config),
    record: <C extends SchemaConfig>(config: C) => new SchemaRecord<C>(config),
    map: <K extends SchemaRule, C extends SchemaConfigMap>(key: K, config: C) => (new SchemaMap<K, C>(key, config)),
    list: <C extends SchemaConfigMap>(config: C) => (new SchemaList<C>(config)),
    datetime,
    storage,
}
