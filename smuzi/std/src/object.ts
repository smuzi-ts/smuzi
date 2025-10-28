export function keysOfObject<T extends object>(keys: (keyof T)[]): (keyof T)[] {
    return keys;
}