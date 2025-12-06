import { Option, OptionFromNullable } from "#lib/option.js";
import {dump} from "#lib/debug.js";

export class StdList<T = unknown> {
    readonly #list: T[];

    constructor(list?: T[]) {
        this.#list = list ?? [];
    }

    get(key: number) {
        return OptionFromNullable(this.#list[key]);
    }

    add(value: T) {
        this.#list.push(value);
        return this;
    }

    delete(key: number) {
        this.#list.splice(key, 1)
        return this;
    }

    get size() {
        return this.#list.length;
    }

    keys() {
        return this.#list.keys();
    }
    unsafeSource(): T[] {
        return this.#list;
    }
}