import { log } from "console";

export function echo<T>(v: T): T
{
    log("ECHO", v);
    return v;
}