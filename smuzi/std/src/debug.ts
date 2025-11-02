import { trace, debug } from "console";
import { panic } from "./panic.ts";

export function dump<T extends unknown[]>(v: T): T
{
    debug("ECHO", v);
    return v;
}