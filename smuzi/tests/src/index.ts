
export {assert} from "#lib/assert.js"
export * from "#lib/newThrow.js"
export const okMsg = (msg = ""): string => `${msg} - exp ok`;
export const errMsg = (msg = ""): string => `${msg} - exp err`;
export const invalidMsg = (msg = ""): string => `${msg} - exp invalid`;

export type TAssertionError = {
    message: string,
    actual: unknown,
    expected: unknown,
    operator: string,
}

export function assertionError(details: TAssertionError) {
    throw details;
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