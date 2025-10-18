import { Context } from "#lib/index.ts";

export function list(context: Context) {
    return "messages list";
}

export function find(context: Context) {
    return "message find id="+context.params.unwrapByKey("id");
}

export function create(context: Context) {
    return "create message";
}

export function update(context: Context) {
    return "message update id="+context.params.unwrapByKey("id");
}