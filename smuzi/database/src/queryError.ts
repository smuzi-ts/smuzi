import {TQueryError} from "#lib/types.js";
import {Option} from "@smuzi/std";

export class QueryError implements TQueryError {
    code: Option<string>;
    detail: Option<string>;
    message: string;
    table: Option<string>;
}