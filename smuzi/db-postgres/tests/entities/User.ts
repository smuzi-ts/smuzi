import {schema} from "@smuzi/schema";
import {schemaDb} from "@smuzi/database";

export const userSchema = schema.record({
    id: schemaDb.autoNumber(),
    name: schema.string(),
    email: schema.string(),
    password: schema.string(),
    created_at: schema.datetime.native(),
})

export type UserEntity = typeof userSchema.__infer;