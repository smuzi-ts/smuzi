import {AutoId} from "@smuzi/database";
import {Option} from "@smuzi/std";

export type TUserRow = {
    id: AutoId<Option<string>>,
    name: Option<string>,
    email: Option<string>,
    password: Option<string>,
    created_at: Option<Date>,
}