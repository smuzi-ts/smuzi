
export function dump<T extends unknown>( values: T): T
{
    console.log("ECHO", values);
    return values;
}