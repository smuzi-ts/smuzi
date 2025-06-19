import {faker} from "./index.js";

export function items({ length = 5, builderItem = () => faker.string() } = {}) {
    return Array.from({ length }, (_, i) => builderItem(i));
}

export function getItem(array = []) {
    return array[faker.integer(0, array.length - 1)];
}
