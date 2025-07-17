import { trace } from "console";

export function dump<T extends unknown[]>(...v: T): T
{
    trace("ECHO", ...v);
    return v;
}