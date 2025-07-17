import { log } from "console";

export function dump<T extends unknown[]>(...v: T): T
{
    log("ECHO", ...v);
    return v;
}