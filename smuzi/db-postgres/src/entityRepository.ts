import {TDatabaseClient} from "@smuzi/database";

export const buildPostgresEntityRepository = (client: TDatabaseClient) => <Row extends Record<string, unknown>>(table: string) => {
    return {
        async find(id: number, { columns = ['*'], idColumn = 'id'}: { columns?: string[], idColumn?: string } = {}) {
            return (await client.query<Row>(`SELECT ${columns.join(',')} FROM ${table} where ${idColumn} = $1`, [id]))
                .mapOk(res => res.rows.get(0));
        },
    }
}
