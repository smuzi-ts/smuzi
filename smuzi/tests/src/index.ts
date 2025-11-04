export {it, describe, skip} from "node:test";
export {assert} from "./assert.ts"

export const okMsg = (msg = ""): string => `${msg} - exp ok`;
export const errMsg = (msg = ""): string => `${msg} - exp err`;
export const invalidMsg = (msg = ""): string => `${msg} - exp invalid`;

export function repeatIt(
    repeat: number = 1,
    name: string = "",
    fn: (name: string) => void
): void {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name} - #${i}`);
    }
}