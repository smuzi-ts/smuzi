import { StdMap, StdList } from "@smuzi/std";

export function asArray<T extends unknown>(count: number, callback: () => T): T[] {
    const res: T[] = [];
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}

export function asNativeSet<T extends unknown>(count: number, callback: () => T): Set<T> {
    const res = new Set<T>;
    for (let i = 0; i < count; ++i) {
        res.add(callback());
    }

    return res;
}

export function asStdMap<T extends unknown>(count: number, callback: () => T): StdMap {
    const res = new StdMap;
    for (let i = 0; i < count; ++i) {
        res.set(i, callback());
    }

    return res;
}

export function asStdList<T extends unknown>(count: number, callback: () => T): StdList<T> {
    const res = new StdList<T>();
    for (let i = 0; i < count; ++i) {
        res.push(callback());
    }

    return res;
}