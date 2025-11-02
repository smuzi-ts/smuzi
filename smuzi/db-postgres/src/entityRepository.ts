import {TDatabaseClient, TEntityRepository, TInsertRow} from "@smuzi/database";
import {OptionFromNullable} from "@smuzi/std";

export const buildPostgresEntityRepository = (client: TDatabaseClient)  => <Entity>(table: string): TEntityRepository<Entity> => {
    return {
        async find(id: number, { columns = ['*'], idColumn = 'id'}) {
            return (await client.query<Entity>(`SELECT ${columns.join(',')} FROM ${table} where ${idColumn} = $1`, [id])).wrapOk(res => OptionFromNullable(res[0]));
        },
        async insertRow(row: TInsertRow<Entity>, idColumn = 'id') {
            return
                //TODO: protected for injections
                const columns = Object.keys(row);
                const values = Object.values(row);
                const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
                const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

                return (await client.query(sql, values))
                    .wrapOk(rows => OptionFromNullable(rows[0][idColumn]));
            }
    }
}