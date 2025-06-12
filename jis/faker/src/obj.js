import {faker} from "./index.js";

export function getProperty(obj) {
    return faker.array.item(Object.keys(obj));
}

export function getPropertyValue(obj) {
    return obj[faker.array.item(Object.keys(obj))];
}

