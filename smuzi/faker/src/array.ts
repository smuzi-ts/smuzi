import {faker} from "./index.js";

export function items({ length = 5, builderItem = (i) => faker.string() } = {}): unknown[] {
    return Array.from({ length }, (_, i) => builderItem(i));
}

export function getItem<I>(array:I[]): I {
    return array[faker.integer(0, Math.max(0, array.length - 1))];
}
