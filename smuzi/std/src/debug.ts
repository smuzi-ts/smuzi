export function dump<T extends unknown[]>(v: T): T
{
    console.log("ECHO", v);
    return v;
}