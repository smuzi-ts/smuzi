
import {Err, None, Ok, Option, Result, Simplify, StdRecord} from "@smuzi/std";
import {DBSchemaRule} from "#lib/schema/types.js";

export type DBSchemaAutonumberConfig = {
    msgIncorrectFromDB: string,

};

export class DBSchemaAutonumber<C extends DBSchemaAutonumberConfig> implements DBSchemaRule {
    #config: C;
    __inferToDB: Option<never>;
    __inferFromDB: number;

    constructor(config: C) {
        this.#config = config;
    }

    fake() {
        return None();
    }

    castFromDB(input: unknown) {
        return input
    }

    castToDB(input: unknown): Result<never> {
        return Err("Autonumber should be auto-generated via DB");
    }
}
