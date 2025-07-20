import {assert, describe, it, ok, err} from "@smuzi/tests";
import * as U from "#lib/utils.js";
import {Schema, Struct, UnstrictStruct} from "#lib/spec.js";
import {faker} from "@smuzi/faker";

describe("Utils-Check", () => {
    it("isString", () => {
        assert.isTrue(U.isString('some_string'));
        assert.isTrue(U.isString(''));

        assert.isFalse(U.isString(2));
        assert.isFalse(U.isString(null));
        assert.isFalse(U.isString(true));
    })

    it("isInteger", () => {
        assert.isTrue(U.isInteger(22));
        assert.isTrue(U.isInteger(0));

        assert.isFalse(U.isInteger('1'));
        assert.isFalse(U.isInteger('some_string'));
        assert.isFalse(U.isInteger(true));
    })

    it("isNone", () => {
        assert.isTrue(U.isNone(null));
        assert.isTrue(U.isNone());

        assert.isFalse(U.isNone(''));
        assert.isFalse(U.isNone(0));
        assert.isFalse(U.isNone(false));
    })

    it("isBool", () => {
        assert.isTrue(U.isBool(true));
        assert.isTrue(U.isBool(false));

        assert.isFalse(U.isBool(''));
        assert.isFalse(U.isBool(0));
        assert.isFalse(U.isBool(1));
    })

    it("isEmpty", () => {
        assert.isTrue(U.isEmpty());
        assert.isTrue(U.isEmpty(null));
        assert.isTrue(U.isEmpty(''));
        assert.isTrue(U.isEmpty([]));


        assert.isFalse(U.isEmpty(0));
        assert.isFalse(U.isEmpty('some_string'));
        assert.isFalse(U.isEmpty(false));
        assert.isFalse(U.isEmpty([0]));
        assert.isFalse(U.isEmpty({}));
    })

    it("isArray", () => {
        assert.isTrue(U.isArray([]));
        assert.isTrue(U.isArray([1,2,3]));

        assert.isFalse(U.isArray(''));
        assert.isFalse(U.isArray(1));
        assert.isFalse(U.isArray({a:1}));
    })


    it("isFunction", () => {
        const f1 = () => 1;
        const f2 = (val) => val;
        function f3() {
        }

        assert.isTrue(U.isFunction(f1));
        assert.isTrue(U.isFunction(f2));
        assert.isTrue(U.isFunction(f3));

        assert.isFalse(U.isFunction('f1'));
        assert.isFalse(U.isFunction([]));
        assert.isFalse(U.isFunction({}));
    })

    it("isObject", () => {
        class isObjectTest {}
        const objInst = new isObjectTest()

        assert.isTrue(U.isObject(objInst));
        assert.isTrue(U.isObject({}));
        assert.isTrue(U.isObject({a:1}));

        assert.isFalse(U.isObject('some_string'));
        assert.isFalse(U.isObject(1));
        assert.isFalse(U.isObject([]));
    })

    it("isStruct", () => {
        const someStruct1 = Struct(
            faker.spec.structName(),
            faker.spec.schema(),
        )

        const someStruct2 = UnstrictStruct(
            faker.spec.structName(),
            faker.spec.schema(),
        )

        assert.isTrue(U.isStruct(someStruct1));
        assert.isTrue(U.isStruct(someStruct2));

        assert.isFalse(U.isStruct({a:1}));
        assert.isFalse(U.isStruct({}));
        assert.isFalse(U.isStruct([]));
    })

    it("isStructInstance - Strict Structure", () => {
        const someStruct = Struct(
            "someStruct",
            { field1: Schema.string() }
        );
        const inst1 = someStruct({ field1: faker.string() })

        assert.isTrue(U.isStructInstance(inst1));

        assert.isFalse(U.isStructInstance(someStruct));
    })

    it("isStructInstance - Unstrict Structure", () => {
        const someStruct = UnstrictStruct(
            'someStruct',
            {
                field2: Schema.string()
            }
        )

        const result = someStruct({ field2: faker.string() })
        const inst1 = result.val;

        assert.isTrue(U.isStructInstance(inst1));

        assert.isFalse(U.isStructInstance(result));
        assert.isFalse(U.isStructInstance(someStruct));
    })
})
