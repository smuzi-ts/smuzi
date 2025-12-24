import { Option, OptionFromNullable } from "#lib/option.js";
import {dump} from "#lib/debug.js";

export class StdList<T = unknown> {
    #list: Array<T>;

    constructor(array: Array<T> = new Array<T>()) {
        this.#list = array;
    }

    get(key: number): Option<T> {
        return OptionFromNullable(this.#list[key]);
    }

    has(key: number): boolean {
        return key in this.#list;
    }

    push(value: T): this {
        this.#list.push(value);
        return this;
    }

    *entries(): IterableIterator<[number, Option<T>]> {
        for (let k = 0; k < this.#list.length; k++) {
            yield [k, this.get(k)];
        }
    }

    [Symbol.iterator](): IterableIterator<[number, Option<T>]> {
        return this.entries();
    }

    unsafeSource(): Array<T> {
        return this.#list;
    }
}