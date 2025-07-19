import { trace, debug } from "console";
import { panic } from "./panic.ts";

export function dump<T extends unknown[]>(...v: T): T
{
    debug("ECHO", ...v);
    return v;
}

export function dd<T extends unknown[]>(...v: T): never
{
    debug("ECHO", ...v);
    panic("var_dump");
}