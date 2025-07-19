import { trace, debug } from "console";

export function dump<T extends unknown[]>(...v: T): T
{
    debug("ECHO", ...v);
    return v;
}