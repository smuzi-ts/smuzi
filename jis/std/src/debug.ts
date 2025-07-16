import { log } from "console";

export function dump<T>(v: T): T
{
    log("ECHO", v);
    return v;
}