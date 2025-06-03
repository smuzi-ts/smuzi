class Maybe {
    #val;

    constructor(val) {
        this.#val = val
    }

    static of(val) {
        return new Maybe(val)
    }

    map(fn) {
        return this.isNothing ? this : new Maybe(fn(this.#val))
    }

    get isNothing() {
        return this.#val === undefined || this.#val === null
    }

    join() {
        return this.#val
    }
}

const res = Maybe.of(5)
    .map(x => null)
    .map(x => x + 2)
    .join()


console.log('Result=', res)