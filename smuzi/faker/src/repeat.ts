import { StdMap, StdList } from "@smuzi/std";

export function asArray<T extends unknown>(count: number, callback: () => T): T[] {
    const res: T[] = [];
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}

export function asMap<T extends unknown>(count: number, callback: () => T): StdMap {
    const res = new StdMap;
    for (let i = 0; i < count; ++i) {
        res.set(i, callback());
    }

    return res;
}

export function asList<T extends unknown>(count: number, callback: () => T): StdList<T> {
    const res = new StdList<T>();
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}