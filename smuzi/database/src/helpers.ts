import {Err, isEmpty, Ok, Result} from "@smuzi/std";
import {TParams, TPrimitive} from "#lib/types.ts";

export function clearSQL(sql: string): string
{
    return sql.trim();
}

export function preparedSqlFromObjectToArrayParams(sql: string, params: TParams): Result<{sql: string, params: any[]}, string>
{
    let paramArray = [];
    let index = 1;
    let error = '';

    const processedSql = sql.replace(/:(\w+)/g, (_, key) => {
        if (params.hasOwnProperty(key)) {
            paramArray.push(params[key]);
            return `$${index++}`;
        }
        error += `Missing parameter: ${key}. `;
    });

    if (isEmpty(error)) {
        return Ok({sql: processedSql, params: paramArray});
    }

    return Err(error);
}