import { Option, OptionFromNullable } from "./option.js";
import {dump} from "./debug.js";
import { Err, Ok, Result } from "./result.js";

export class StdList<T = unknown> {
    #list: Array<T>;

    constructor(array: Array<T> = new Array<T>()) {
        this.#list = array;
    }

    get(key: number): Result<T, string> {
        return key in this.#list ? Ok(this.#list[key]) : Err("Element with key ["+key+"] does not exist in StdList.");
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

    count(): number {
        return this.#list?.length ?? 0;
    }

    findFirst(checker: () => boolean): Option<T> {
        return OptionFromNullable(this.#list.find(checker));
    }
}