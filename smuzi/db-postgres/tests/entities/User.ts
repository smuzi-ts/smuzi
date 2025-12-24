import {schema} from "@smuzi/schema";
import {dbSchema, TableSchema} from "@smuzi/database";

export const userTable = new TableSchema('users',
    dbSchema.row({
        id: dbSchema.autoNumber(),
        name: schema.string(),
        email: schema.string(),
        password: schema.string(),
        created_at: schema.datetime.native(),
    }))

export type UserEntity = typeof userTable.__inferSchema.__infer;