import { SchemaRule } from "@smuzi/schema";

export function make<T extends SchemaRule>(schema: T): T["__infer"] {
    return schema.fake();
}