import {StdRecord} from "#lib/record.js";

export type Simplify<T> = {[K in keyof T]: T[K]} & {};

export type Primitive = string | number | boolean;

export type RecordFromKeys<
    T extends Record<PropertyKey, unknown>,
    Only extends readonly (keyof T)[]
> = {
    [K in Only[number]]: K extends keyof T ? T[K] : never;
};


export type ValueOf<T, K extends keyof T> = T[K];
