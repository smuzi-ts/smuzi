import {faker} from "./index.js";

export function getProperty(obj: Record<string, unknown>): string {
    return faker.array.getItem(Object.keys(obj));
}

export function getPropertyValue<T extends unknown>(obj: Record<string, T>): T {
    return obj[faker.array.getItem(Object.keys(obj))];
}

