import {Option} from "@smuzi/std";

export type TUserRow = {
    id: Option<string>,
    name: Option<string>,
    email: Option<number>,
    password: Option<string>,
    created_at: Option<Date>,
}
