
declare global {
    function _print(value: string): void;

    const _std: typeof import("@smuzi/std");
}

export {};