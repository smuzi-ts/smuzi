import {StdRecord} from "#lib/record.js";

export type Simplify<T> = {[K in keyof T]: T[K]} & {};

export type Primitive = string | number | boolean;

export type RecordFromKeys<
    T extends readonly string[],
    P extends StdRecord<any>
> = Simplify<{
    [K in T[number]]: K extends keyof P ? P[K] : never;
}>;

export type ValueOf<T, K extends keyof T> = T[K];
