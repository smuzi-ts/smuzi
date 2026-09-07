import {dump, Err, isEmpty, isOption, Ok, Result} from "@smuzi/std";
import {TQueryParams} from "#lib/types.js";

export function clearSQL(sql: string): string
{
    return sql.trim();
}

export function preparedSqlFromObjectToArrayParams(sql: string, params: TQueryParams): Result<{sql: string, params: any[]}, string>
{
    let paramArray: string[] = [];
    let index = 1;
    let error = '';

    const processedSql = sql.replace(/:(\w+)/g, (input, key) => {
        if (params.hasOwnProperty(key)) {
            paramArray.push(isOption(params[key]) ? params[key].someOr(null) : params[key]);
            return `$${index++}`;
        }
        error += `Missing parameter: ${key}. `;

        return input;
    });

    if (isEmpty(error)) {
        return Ok({sql: processedSql, params: paramArray});
    }

    return Err(error);
}