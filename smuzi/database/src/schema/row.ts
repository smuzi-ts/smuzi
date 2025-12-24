import {DBSchemaRule} from "#lib/schema/types.js";
import {Err, None, Ok, Option, Result} from "@smuzi/std";

export type DBSchemaRowConfig = Record<PropertyKey, DBSchemaRule>;

type InferToDB<C extends DBSchemaRowConfig> = {
    [K in keyof C]: C[K]['__inferToDB'];
};

type InferFromDB<C extends DBSchemaRowConfig> = {
    [K in keyof C]: C[K]['__inferFromDB'];
};


export class DBSchemaRow<C extends DBSchemaRowConfig> implements DBSchemaRule {
    #config: C;
    __inferToDB: InferToDB<C>;
    __inferFromDB: InferFromDB<C>;

    constructor(config: C) {
        this.#config = config;
    }

    castFromDB(input: unknown): Result<typeof this.__inferFromDB, string> {
        return typeof input === "number" ? Ok(input) : Err(this.#config.msgIncorrectFromDB)
    }

    castToDB(input: unknown): Result<never> {
        return Err("Autonumber should be auto-generated via DB");
    }
}
