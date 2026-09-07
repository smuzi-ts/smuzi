import {TDatabaseClient} from "@smuzi/database";
import {Option} from "@smuzi/std";

export const buildPostgresEntityRepository = (client: TDatabaseClient)  => <Entity>(table: string) => {
    return {
        async find(id: number, { columns = ['*'], idColumn = 'id'}) {
            return (await client.query(`SELECT ${columns.join(',')} FROM ${table} where ${idColumn} = $1`, [id]))
                .mapOk(res => res.rows.get(0) as Option<Entity>);
        },
    }
}