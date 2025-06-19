import {assert, describe, it, ok, err} from "@jis/tests";
import {getClass, readonly, clone} from "#lib/prelude.js";

describe("Syntax-Obj", () => {
    it("getClass", () => {
        class SomeTestA {

        }

        class SomeTestB extends SomeTestA {

        }

        const objA = new SomeTestA();
        const objB = new SomeTestB();

        assert.equal(getClass(objA),'SomeTestA');
        assert.equal(getClass(objB),'SomeTestB');
    })

    it("readonly", () => {
        const inmutableObj = readonly({a: 1, b: 2})

        assert.expectAnyErrors(() => {
            inmutableObj.a = 2;
        })
    })

    it("clone", () => {
        const obj1 = {a: 1}
        let clonedObj = clone({a: 1})

        assert.isTrue(obj1 !== clonedObj);

        clonedObj.a = 2;
        assert.equal(obj1.a, 1);

        clonedObj = null;
        assert.equal(obj1.a, 1);
    })
})
