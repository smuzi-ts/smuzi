import {AssertionError} from "node:assert";

export {it, describe, skip} from "node:test";
export {assert} from "#lib/assert.js"

export const okMsg = (msg = ""): string => `${msg} - exp ok`;
export const errMsg = (msg = ""): string => `${msg} - exp err`;
export const invalidMsg = (msg = ""): string => `${msg} - exp invalid`;

type TAssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

export function assertionError(details: TAssertionError) {
    throw new AssertionError(details);
}

export function repeatIt(
    repeat: number = 1,
    name: string = "",
    fn: (name: string) => void
): void {
    for (let i = 1; i <= repeat; i++) {
        fn(`${name} - #${i}`);
    }
}