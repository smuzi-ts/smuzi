import {Option, Result} from "@smuzi/std";

export interface DBSchemaRule {
    __inferFromDB: unknown;
    __inferToDB: unknown;

    castToDB(input: unknown)
    castFromDB(input: unknown)
}