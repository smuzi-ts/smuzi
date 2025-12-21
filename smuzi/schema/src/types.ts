import {SchemaObject} from "#lib/obj.js";
import {Result} from "@smuzi/std";
import {SchemaRecord} from "#lib/record.js";
export interface SchemaRule {
    __infer: unknown;
    __inferError: unknown;

    validate(input: unknown): Result<true, SchemaValidationError<unknown>>
    fake(): typeof this.__infer
}
export type SchemaConfig = Record<PropertyKey, SchemaRule | SchemaObject | SchemaRecord<any>>;
export type SchemaValidationError<D> = {
    msg: string;
    data: D;
}