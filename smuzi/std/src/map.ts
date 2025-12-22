import { Option, OptionFromNullable } from "#lib/option.js";

export class StdMap<K = unknown, V = unknown> {
    #map: Map<K, V>;

    constructor(entries?: Iterable<[K, V]>) {
        this.#map = new Map(entries);
    }
    get(key: K): Option<V> {
        return OptionFromNullable(this.#map.get(key));
    }

    has(key: K): boolean {
        return this.#map.has(key);
    }

    set(key: K, value: V): this {
        this.#map.set(key, value);
        return this;
    }

    setOther(key: unknown, value: V) {
        this.#map.set(key as K, value);
        return this;
    }

    getOther(key: unknown): Option<V> {
        return OptionFromNullable(this.#map.get(key as K));

    }

    delete(key: K): boolean {
        return this.#map.delete(key);
    }

    clear(): void {
        this.#map.clear();
    }

    get size(): number {
        return this.#map.size;
    }

    *entries(): IterableIterator<[K, Option<V>]> {
        for (const [k, v] of this.#map) {
            yield [k, OptionFromNullable(v)];
        }
    }

    keys(): IterableIterator<K> {
        return this.#map.keys();
    }

    *values(): IterableIterator<Option<V>> {
        for (const v of this.#map.values()) {
            yield OptionFromNullable(v);
        }
    }

    [Symbol.iterator](): IterableIterator<[K, Option<V>]> {
        return this.entries();
    }

    unsafeSource(): Map<K, V> {
        return this.#map;
    }
}