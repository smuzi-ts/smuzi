import { StdMap } from "@smuzi/std";

export function asArray<T extends unknown>(count: number, callback: () => T): T[] {
    const res: T[] = [];
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}

export function asMap<T extends unknown>(count: number, callback: () => T): StdMap {
    const res: T[] = [];
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}