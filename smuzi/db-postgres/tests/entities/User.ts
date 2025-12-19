import {schema} from "@smuzi/schema";

export const userSchema = schema.record({
    id: schema.string(),
    name: schema.string(),
    email: schema.string(),
    password: schema.string(),
    created_at: schema.date.native(),
})

export type UserRow = typeof userSchema.__infer;