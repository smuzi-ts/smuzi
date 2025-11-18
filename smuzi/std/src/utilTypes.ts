export type RecordFromKeys<
    T extends readonly string[], // Список ключей для включения
    P extends Record<string, unknown> // Тип-источник с определениями всех полей
> = {
    // K in T[number]: Итерируемся по строковым литералам из массива T
    // P[K]: Для каждого ключа K берем тип из исходного типа P
    [K in T[number]]: K extends keyof P ? P[K] : never;
};

export type Simplify<T> = {[K in keyof T]: T[K]} & {};