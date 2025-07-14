export {it, describe, skip} from "node:test";
export {assert} from "./assert.js"
export const ok = (message = "") => `${message} - exp ok`;
export const err = (message = "") => `${message} - exp err`;
export const invalid = (message = "") => `${message} - exp invalid`;

export function repeatIt(repeat = 1, name = '', fn) {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name} - #${i}`);
    }
}
