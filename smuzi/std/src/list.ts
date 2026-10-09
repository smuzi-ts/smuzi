import { Err, Ok, Result } from "./result.js";
import { StdError } from "./error.js";

export const elementNotFoundInStdList = (key) => new StdError("Element with key ["+key+"] does not exist in StdList.")

export class StdList<T = unknown> {
    #list: Array<T>;

    constructor(array: Array<T> = new Array<T>()) {
        this.#list = array;
    }

    get(key: number): Result<T, StdError> {
        return key in this.#list ? Ok(this.#list[key]) : Err(elementNotFoundInStdList(key));
    }

    has(key: number): boolean {
        return key in this.#list;
    }

    push(value: T): this {
        this.#list.push(value);
        return this;
    }

    *entries(): IterableIterator<[number, Result<T, StdError>]> {
        for (let k = 0; k < this.#list.length; k++) {
            yield [k, this.get(k)];
        }
    }

    [Symbol.iterator](): IterableIterator<[number, Result<T, StdError>]> {
        return this.entries();
    }

    unsafeSource(): Array<T> {
        return this.#list;
    }

    count(): number {
        return this.#list?.length ?? 0;
    }

    findFirst(criteria: () => boolean): Result<T, StdError> {
        const element = this.#list.find(criteria);
        return element == undefined ? Err(new StdError("Not finded element via criteria")) : Ok(element);
    }
}