import {schema} from "@smuzi/schema";

export const usersTable = 'users';

export const userSchema =
    schema.obj({
        id: schema.storage.autoNumber(),
        name: schema.string(),
        email: schema.string(),
        password: schema.string(),
        created_at: schema.datetime.native(),
    });

export type UserEntity = typeof userSchema.__infer;