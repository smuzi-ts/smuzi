import {faker} from "./index.js";

export function getProperty(obj) {
    const keys = Object.keys(obj);

    return keys[faker.integer(0, keys.length)];
}
