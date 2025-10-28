import {Option} from "@smuzi/std";

export type TUserRow = {
    id: Option<string>,
    name: Option<string>,
    branch: Option<number>,
    action: Option<string>,
    sql_source: Option<string>,
    created_at: Option<Date>,
}