import { Option, OptionFromNullable } from "#lib/option.js";

export class StdRecord<T extends Record<PropertyKey, unknown>> {
    #entity: T;

    constructor(entity?: T) {
        this.#entity = entity ?? Object() as T;
    }

    set<K extends keyof T>(key: K, value: T[K]): void {
        this.#entity[key] = value;
    }

    get<K extends keyof T>(key: K): Option<T[K]> {
        return OptionFromNullable(this.#entity[key]);
    }

    *[Symbol.iterator](): IterableIterator<[keyof T, Option<T[keyof T]>]> {
        for (const key in this.#entity) {
            if (Object.prototype.hasOwnProperty.call(this.#entity, key)) {
                yield [key as keyof T, this.get(key)];
            }
        }
    }

    unsafeSource(): T {
        return this.#entity;
    }

    isEmpty(): boolean {
        return Object.keys(this.#entity).length === 0

    }
}

type TKey = string | number | symbol;
type TEntries<K extends TKey, V> = Record<K, V>;

// export type StdRecordFromObj<T> = StdRecord<keyof T, T[keyof T]>
//

// export class StdRecord<K extends TKey, V = unknown> {
//     #entries: TEntries<K, V>;
//
//     constructor(entries?:  TEntries<K, V>) {
//         this.#entries = entries ?? Object();
//     }
//
//     set(key: K, val: V): void {
//         this.#entries[key] = val;
//     }
//
//     setOther(key: TKey, val: V): void {
//         this.#entries[key] = val;
//     }
//
//     get(key: K): Option<V>
//     {
//        return OptionFromNullable(this.#entries[key as K]);
//     }
//
//     getOther(key: TKey): Option<V>
//     {
//        return OptionFromNullable(this.#entries[key]);
//     }
//
//    *[Symbol.iterator](): IterableIterator<[K, Option<V>]> {
//     for (const key in this.#entries) {
//         if (Object.prototype.hasOwnProperty.call(this.#entries, key)) {
//             yield [key as K, this.get(key)];
//         }
//     }
//     }
//
//     unsafeSource(): TEntries<TKey, V> {
//         return this.#entries;
//     }
//
//     entries(): IterableIterator<[K, Option<V>]> {
//         return this[Symbol.iterator]();
//     }
//
//     *unsafeEntries(): IterableIterator<[K, V]> {
//      for (const key in this.#entries) {
//         if (Object.prototype.hasOwnProperty.call(this.#entries, key)) {
//             yield [key as K, this.#entries[key]!];
//         }
//      }
//     }
//
//     toMap(): Map<K, Option<V>> {
//         return new Map(this.entries());
//     }
//
//     toUnsafeMap(): Map<K, V> {
//         return new Map(this.unsafeEntries());
//     }
// }