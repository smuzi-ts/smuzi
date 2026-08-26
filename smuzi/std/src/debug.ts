
export function dump<T extends unknown>( values: T): T
{
    console.log("dump", values);
    return values;
}