export type RecordFromKeys<T = string[], V = unknown> = {
    [K in keyof T]: V;
};