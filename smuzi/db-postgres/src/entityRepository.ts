import {TDatabaseClient} from "@smuzi/database";
import {OptionFromNullable} from "@smuzi/std";

export const buildPostgresEntityRepository = (client: TDatabaseClient)  => <Entity>(table: string) => {
    return {
        async find(id: number, { columns = ['*'], idColumn = 'id'}) {
            return (await client.query<Entity>(`SELECT ${columns.join(',')} FROM ${table} where ${idColumn} = $1`, [id])).mapOk(res => OptionFromNullable(res[0]));
        },
    }
}