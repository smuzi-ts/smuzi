import { Option, OptionFromNullable } from "#lib/option.js";

type TKey = string | number | symbol;
type TEntries<K extends TKey, V> = Partial<Record<K, V>>;

export class StdRecord<K extends TKey, V> {
    #entries: TEntries<K, V>;

    constructor(entries:  TEntries<K, V> = {}) {
        this.#entries = entries
    }

    set(key: K, val: V): void {
        this.#entries[key] = val;
    }

    setOther(key: TKey, val: V): void {
        this.#entries[key] = val;
    }

    get(key: K): Option<V>
    {
       return OptionFromNullable(this.#entries[key as K]);
    }

    getOther(key: TKey): Option<V>
    {
       return OptionFromNullable(this.#entries[key]);
    }

   *[Symbol.iterator](): IterableIterator<[K, Option<V>]> {
    for (const key in this.#entries) {
        if (Object.prototype.hasOwnProperty.call(this.#entries, key)) {
            yield [key as K, this.get(key)];
        }
    }
    }

    unsafeSource(): TEntries<TKey, V> {
        return this.#entries;
    }

    entries(): IterableIterator<[K, Option<V>]> {
        return this[Symbol.iterator]();
    }

    *unsafeEntries(): IterableIterator<[K, V]> {
     for (const key in this.#entries) {
        if (Object.prototype.hasOwnProperty.call(this.#entries, key)) {
            yield [key as K, this.#entries[key]!];
        }
     }    
    }

    toMap(): Map<K, Option<V>> {
        return new Map(this.entries());
    }

    toUnsafeMap(): Map<K, V> {
        return new Map(this.unsafeEntries());
    }
}