import {schema} from "@smuzi/schema";

export const userSchema = schema.record({
    id: schema.string(),
    name: schema.string(),
    email: schema.string(),
    password: schema.string(),
    created_at: schema.datetime.native(),
})

export type UserEntity = typeof userSchema.__infer;