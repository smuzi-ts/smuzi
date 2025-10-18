import { Context } from "#lib/index.ts";

export function list(context: Context) {
    return "users list";
}

export function find(context: Context) {
    return "user find id="+context.params.unwrapByKey("id");
}

export function create(context: Context) {
    return "create user";
}

export function update(context: Context) {
    return "user update id="+context.params.unwrapByKey("id");
}