
declare global {
    function _print(value: string): void;
    async function _component(component: string, slots: Record<string, () => string>): Promise;
    async function _component(component: string): Promise;

    const _std: typeof import("@smuzi/std");
}

export {};