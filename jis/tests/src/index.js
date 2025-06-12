export {it, describe} from "node:test";
export {assert} from "./assert.js"

export function repeatIt(repeat = 1, name = '', fn) {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name}-#${i}`);
    }
}
