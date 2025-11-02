import {databaseConfig} from "#configs/database.ts";
import {keysOfObject, Option, OptionFromNullable} from "@smuzi/std";
import {PrimaryKey, TInsertRow} from "@smuzi/database";

type TUserRow = {
    id: PrimaryKey<Option<string>>,
    name: Option<string>,
    email: Option<string>,
    password: Option<string>,
    created_at: Option<Date>,
}

export const UserRepository = (client = databaseConfig.current.client) => {

    const table = 'users';

    const publicFields = keysOfObject<TUserRow>(['id', 'name', 'email', 'created_at']).join(',')

    return {
        getTable: () => table,
        async find(id: number) {
            return (await client.query<TUserRow>(`SELECT ${publicFields} FROM ${table} where id = $1`, [id])).mapOk(res => OptionFromNullable(res[0]));
        },
        async insertRow(row: TInsertRow<TUserRow>) {
            return client.insertRow<TUserRow>(table, row);
        },
    }
}

