import { Option, OptionFromNullable } from "#lib/option.js";

export class StdMap<K, V> {
    #map: Map<K, V>;

    constructor(entries?: Iterable<[K, V]>) {
        this.#map = new Map(entries);
    }

    /** Получение значения как Option */
    get(key: K): Option<V> {
        return OptionFromNullable(this.#map.get(key));
    }

    /** Проверка наличия ключа */
    has(key: K): boolean {
        return this.#map.has(key);
    }

    /** Добавление или обновление ключа */
    set(key: K, value: V): this {
        this.#map.set(key, value);
        return this;
    }

    /** Удаление ключа */
    delete(key: K): boolean {
        return this.#map.delete(key);
    }

    /** Очистка */
    clear(): void {
        this.#map.clear();
    }

    /** Количество элементов */
    get size(): number {
        return this.#map.size;
    }

    /** Итератор по [key, Option<value>] */
    *entries(): IterableIterator<[K, Option<V>]> {
        for (const [k, v] of this.#map) {
            yield [k, OptionFromNullable(v)];
        }
    }

    /** Итератор по ключам */
    keys(): IterableIterator<K> {
        return this.#map.keys();
    }

    /** Итератор по Option<значениям> */
    *values(): IterableIterator<Option<V>> {
        for (const v of this.#map.values()) {
            yield OptionFromNullable(v);
        }
    }

    /** Поддержка for..of (по [key, Option<value>]) */
    [Symbol.iterator](): IterableIterator<[K, Option<V>]> {
        return this.entries();
    }

    /** forEach с Option */
    forEach(callback: (value: Option<V>, key: K, map: this) => void): void {
        for (const [k, v] of this) {
            callback(v, k, this);
        }
    }
}