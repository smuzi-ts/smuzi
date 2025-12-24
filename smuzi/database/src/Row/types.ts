import {Option, Result} from "@smuzi/std";

export interface DBSchemaRule {
    __inferFromDB: unknown;
    __inferToDB: unknown;

    castToDB(input: unknown): Result
    castFromDB(input: unknown): Result
}