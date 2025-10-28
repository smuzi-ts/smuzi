import {databaseConfig} from "#configs/database.ts";
import {Option} from "@smuzi/std";

export function columns<T extends object>(fields: (keyof T)[]): (keyof T)[] {
    return fields;
}

type ExcludeSave<T> = T & { readonly __excludeSave: unique symbol };

type UnwrapOption<T> = T extends Option<infer U> ? U : T;

type IsExcludeSave<T> = T extends ExcludeSave<infer U>
    ? (U extends Option<any> ? true : false)
    : false;

type ExcludeExcludeSaveKeys<T> = {
    [K in keyof T]: IsExcludeSave<T[K]> extends true ? never : K
}[keyof T];

type NonOptionalRow<T> = {
    [K in ExcludeExcludeSaveKeys<T>]: UnwrapOption<T[K]>
}

type TUserRow = {
    id: ExcludeSave<Option<string>>,
    name: Option<string>,
    email: Option<string>,
    password: Option<string>,
    created_at: Option<Date>,
}


export const UserRepository = (client = databaseConfig.current.client) => {

    const table = 'users';

    const publicFields = columns<TUserRow>(['id', 'name', 'email', 'created_at']).join(',')

    return {
        getTable: () => table,
        find(id: number) {
            return client.query<TUserRow>(`SELECT ${publicFields} FROM ${this.getTable()}`);
        },
        insertRow(row: NonOptionalRow<TUserRow>) {
            return client.insertRow(this.getTable(), row);
        }
    }
}