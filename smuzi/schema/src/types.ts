import {Result} from "@smuzi/std";

export interface SchemaRule {
    __infer: unknown;
    __inferError: SchemaValidationError<unknown>;

    validate(input: unknown): Result<unknown, SchemaValidationError<unknown>>
    fake(): typeof this.__infer
}
export type SchemaValidationError<D> = {
    msg: string;
    data: D;
}