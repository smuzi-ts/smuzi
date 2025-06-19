export {it, describe, skip} from "node:test";
export {assert} from "./assert.js"
export const ok = (message = "") => `${message} - SUCCESS`;
export const err = (message = "") => `${message} - FAIL`;

export function repeatIt(repeat = 1, name = '', fn) {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name}-#${i}`);
    }
}
