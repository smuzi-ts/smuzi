import {faker} from "./index.js";

export function item(array = []) {
    return array[faker.integer(0, array.length - 1)];
}
